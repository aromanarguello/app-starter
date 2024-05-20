import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";

interface Props {
  name: string;
  label: string;
  placeholder?: string;
  type?: HTMLInputElement["type"];
  min?: number;
}

export const ControlledInput = ({
  name,
  label,
  placeholder,
  type,
  min = 0,
}: Props) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <FormControl>
              <Input
                placeholder={placeholder}
                type={type}
                min={min}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
