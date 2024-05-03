import { Fragment } from "react";
import { Label } from "@shadcnui/label";
import { Field } from "formik";
import { Input } from "@shadcnui/input";

interface CustomFieldProps {
  label: string;
  name: string;
  errors: any;
  touched: any;
  type: string;
}

const CustomField: React.FC<CustomFieldProps> = ({
  name,
  errors,
  touched,
  label,
  type,
}) => {
  return (
    <Fragment>
      <Label className='pt-5 pb-2'>{label}</Label>
      <Field
        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        type={type}
        name={name}
      />
      {errors[name] && touched[name] && (
        <div className='text-red-500 text-xs pt-1'>{errors[name]}</div>
      )}
    </Fragment>
  );
};

export default CustomField;
