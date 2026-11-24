import {
  Directive,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Optional,
  Self
} from '@angular/core';
import { NgControl } from '@angular/forms';
import flatpickr from 'flatpickr';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appDatePicker], [appFlatpickr]'
})
export class DatePickerDirective implements OnInit, OnDestroy, OnChanges {
  @Input() appDatePicker?: any;
  @Input() dateFormat: string = 'Y-m-d';
  @Input() altFormat: string = 'd-M-Y';
  @Input() altInput: boolean = true;
  @Input() altInputClass: string = 'form-control bg-white cursor-pointer';
  @Input() enableTime: boolean = false;
  @Input() time_24hr: boolean = false;
  @Input() minDate?: string | Date;
  @Input() maxDate?: string | Date;
  @Input() mode: 'single' | 'multiple' | 'range' = 'single';
  @Input() placeholder: string = 'Select date...';
  @Input() allowInput: boolean = false;
  @Input() defaultDate?: string | Date;

  @Output() dateChange = new EventEmitter<string>();

  private fpInstance: any = null;
  private valueSub?: Subscription;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() @Self() private ngControl: NgControl
  ) {}

  ngOnInit(): void {
    this.initFlatpickr();

    // Listen to external form/model changes
    if (this.ngControl && this.ngControl.valueChanges) {
      this.valueSub = this.ngControl.valueChanges.subscribe((val) => {
        if (this.fpInstance) {
          const currentFpVal = this.fpInstance.input ? this.fpInstance.input.value : '';
          if (val !== currentFpVal) {
            this.fpInstance.setDate(val || '', false);
          }
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.fpInstance) return;

    if (changes['minDate'] && this.minDate !== undefined) {
      this.fpInstance.set('minDate', this.minDate || null);
    }
    if (changes['maxDate'] && this.maxDate !== undefined) {
      this.fpInstance.set('maxDate', this.maxDate || null);
    }
    if (changes['enableTime']) {
      this.fpInstance.set('enableTime', this.enableTime);
    }
  }

  ngOnDestroy(): void {
    if (this.valueSub) {
      this.valueSub.unsubscribe();
    }
    if (this.fpInstance) {
      this.fpInstance.destroy();
      this.fpInstance = null;
    }
  }

  private initFlatpickr(): void {
    if (this.el.nativeElement.type === 'date') {
      try {
        this.el.nativeElement.type = 'text';
      } catch (e) {
        // In case browser restricts dynamic input type change
      }
    }

    const customConfig = (typeof this.appDatePicker === 'object' && this.appDatePicker !== null)
      ? this.appDatePicker
      : {};

    const initialValue = this.el.nativeElement.value ||
      (this.ngControl ? this.ngControl.value : null) ||
      this.defaultDate ||
      null;

    const options: any = {
      dateFormat: this.dateFormat,
      altInput: this.altInput,
      altFormat: this.altFormat,
      altInputClass: this.altInputClass,
      enableTime: this.enableTime,
      time_24hr: this.time_24hr,
      mode: this.mode,
      allowInput: this.allowInput,
      ...(this.minDate ? { minDate: this.minDate } : {}),
      ...(this.maxDate ? { maxDate: this.maxDate } : {}),
      ...(initialValue ? { defaultDate: initialValue } : {}),
      onChange: (selectedDates: Date[], dateStr: string) => {
        if (this.ngControl && this.ngControl.control) {
          this.ngControl.control.setValue(dateStr);
          this.ngControl.control.markAsDirty();
          this.ngControl.control.markAsTouched();
        }
        this.dateChange.emit(dateStr);
        this.el.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.el.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
      },
      onClose: () => {
        if (this.ngControl && this.ngControl.control) {
          this.ngControl.control.markAsTouched();
        }
      },
      ...customConfig
    };

    // If input had placeholder, apply it to altInput
    if (this.placeholder && !options.placeholder) {
      options.placeholder = this.placeholder;
    }

    this.fpInstance = flatpickr(this.el.nativeElement, options);

    // If altInput is created, assign aria and placeholder
    if (this.fpInstance && this.fpInstance.altInput) {
      if (this.placeholder) {
        this.fpInstance.altInput.placeholder = this.placeholder;
      }
    }
  }
}
