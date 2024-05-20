import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useFormContext } from "react-hook-form";

interface Props {
  options: { value: string; label: string }[];
  name: string;
  label: string;
  placeholder?: string;
}

export const BaseSelect = ({ options, name, label, placeholder }: Props) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex flex-col items-start space-y-2">
            <FormLabel htmlFor={name} className="text-right">
              {label}
            </FormLabel>
            <div className="w-full">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {options.map((option, index) => (
                      <SelectItem key={index} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormItem>
      )}
    />
  );
};
