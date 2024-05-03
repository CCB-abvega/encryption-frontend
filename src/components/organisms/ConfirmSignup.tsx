"use client";

import { Form as FormikForm, Formik } from "formik";
import { AnySchema, object, string } from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shadcnui/card";

import CustomField from "@molecules/CustomField";

import { useRouter } from "next/navigation";

import Link from "next/link";
import CustomButton from "../atoms/CustomButton";

import { confirmSignUp } from "@/services/authService";

interface ConfirmSignupValues {
  email: string;
  otp: string;
}

const signInSchema = object<Record<keyof ConfirmSignupValues, AnySchema>>({
  email: string()
    .email("El email no es válido")
    .required("El email es requerido"),
  otp: string().required("Password is required"),
});

const fields = [
  {
    initialValue: "",
    label: "Correo",
    name: "email",
    type: "email",
  },
  {
    initialValue: "",
    label: "OTP CODE",
    name: "otp",
    type: "password",
  },
];

const ConfirmSignup: React.FC = () => {
  const router = useRouter();

  const onFormSubmit = async (
    values: ConfirmSignupValues,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    const response = await confirmSignUp(values.email, values.otp);

    if (!response) {
      alert("Usuario no confirmado");
    }
    setSubmitting(false);
    router.replace("/signin");
  };

  return (
    <div className='flex justify-center items-center bg-background h-full'>
      <Card className='p-1'>
        <CardHeader>
          <CardTitle>Confirma tu correo</CardTitle>
          <CardDescription>
            Aún no te has registrado?
            <Link className='text-ring' href='/signup'>
              Registrate
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              email: "",
              otp: "",
            }}
            validationSchema={signInSchema}
            onSubmit={(values, { setSubmitting }) => {
              onFormSubmit(values, setSubmitting);
            }}
          >
            {({ isSubmitting, errors, touched, setErrors }) => (
              <FormikForm
                className='flex flex-col'
                onChange={() => setErrors({})}
              >
                {fields.map((field, index) => (
                  <CustomField
                    key={index + field.name}
                    name={field.name}
                    label={field.label}
                    type={field.type}
                    errors={errors}
                    touched={touched}
                  />
                ))}

                <CustomButton
                  type='submit'
                  className='mt-10'
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Iniciar Sesión
                </CustomButton>
              </FormikForm>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmSignup;
