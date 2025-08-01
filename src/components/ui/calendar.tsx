'use client';

import * as React from 'react';
// Chevron icons are provided by react-day-picker's default styling
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      animate
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-between items-center mb-4 px-2',
        caption_label: 'text-sm font-medium',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: '',
        nav_button_next: '',
        table: 'w-full border-collapse',
        head_row: 'flex mb-2',
        head_cell:
          'text-gray-500 rounded-md w-9 font-normal text-xs text-center',
        row: 'flex w-full',
        cell: 'text-center text-sm p-0 relative w-9 h-9 flex items-center justify-center',
        day: cn(
          'h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white',
        day_today: 'bg-gray-100 text-gray-900 font-semibold',
        day_outside: 'text-gray-400 opacity-50',
        day_disabled: 'text-gray-300 opacity-50 cursor-not-allowed',
        day_range_middle:
          'aria-selected:bg-gray-100 aria-selected:text-gray-900',
        day_hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
