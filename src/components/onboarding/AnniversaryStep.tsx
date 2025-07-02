import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OnboardingStepProps } from './types';

export const AnniversaryStep = ({ data, setData, onSkip }: OnboardingStepProps) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-7xl mb-6">💖</div>
      <h2 className="text-2xl font-playfair text-rose-800 mb-2">
        Do you celebrate an anniversary with {data.name}?
      </h2>
      <p className="text-rose-700 mb-8 text-lg">
        We can help you remember this special milestone too
      </p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full py-6 text-xl justify-center rounded-2xl border-2 mb-6 transition-all duration-200 hover:scale-105 text-rose-800",
              data.anniversary 
                ? "bg-rose-50 border-rose-300 shadow-lg" 
                : "border-rose-200 hover:border-rose-300 hover:bg-rose-50"
            )}
          >
            {data.anniversary ? (
              <span className="font-medium">
                {format(data.anniversary, "MMMM do, yyyy")}
              </span>
            ) : (
              <span>Pick your anniversary ✨</span>
            )}
            <CalendarIcon className="ml-3 h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-2 border-rose-200 rounded-2xl shadow-2xl" align="center">
          <Calendar
            mode="single"
            selected={data.anniversary || undefined}
            onSelect={(date) => setData({ ...data, anniversary: date || null })}
            className="pointer-events-auto rounded-2xl"
            initialFocus
            defaultMonth={new Date(2020, 0)}
            captionLayout="dropdown-buttons"
            fromYear={1980}
            toYear={new Date().getFullYear()}
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-lg font-medium text-rose-800",
              nav: "space-x-1 flex items-center",
              nav_button: "h-8 w-8 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl transition-colors",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-rose-700 rounded-lg w-10 font-normal text-sm",
              row: "flex w-full mt-2",
              cell: "h-10 w-10 text-center text-sm p-0 relative hover:bg-rose-100 rounded-lg transition-colors",
              day: "h-10 w-10 p-0 font-normal rounded-lg hover:bg-rose-200 transition-colors text-rose-800",
              day_selected: "bg-rose-500 text-white hover:bg-rose-600 font-medium",
              day_today: "bg-rose-100 text-rose-800 font-medium",
              day_outside: "text-rose-400 opacity-50",
              day_disabled: "text-rose-300 opacity-30",
            }}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        onClick={onSkip}
        className="text-rose-600 hover:text-rose-700 text-lg py-3 px-6 rounded-2xl hover:bg-rose-50"
      >
        Skip for now 💫
      </Button>
    </div>
  );
};