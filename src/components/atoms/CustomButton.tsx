import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { LoaderIcon } from "lucide-react";

interface CustomButtonProps {
  isDisabled: boolean;
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
}

const CustomButton: React.FC<
  React.HTMLAttributes<HTMLButtonElement> & CustomButtonProps
> = ({ isDisabled, isLoading, type, ...props }) => {
  return (
    <Button
      type={type}
      className={cn("text-foreground", props.className)}
      disabled={isDisabled}
    >
      {isLoading ? <LoaderIcon className='animate-spin' /> : props.children}
    </Button>
  );
};
1;

export default CustomButton;
