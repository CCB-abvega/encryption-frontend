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

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import CustomButton from "../atoms/CustomButton";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { signIn } from "@/services/authService";

interface SignInFormValues {
  email: string;
  password: string;
}

const signInSchema = object<Record<keyof SignInFormValues, AnySchema>>({
  email: string()
    .email("El email no es válido")
    .required("El email es requerido"),
  password: string().required("Password is required"),
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
    label: "Contraseña",
    name: "password",
    type: "password",
  },
];

const onFormSubmit = async (
  values: SignInFormValues,
  setSubmitting: (isSubmitting: boolean) => void
) => {
  const response = await signIn(values.email, values.password);

  if (!response?.AccessToken) {
    console.log("Usuario o contraseña invalidos");
  }
};

const SignInForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "CredentialsSignin") {
      toast({
        title: "Error de inicio de sesión",
        description: "El usuario o la contraseña son incorrectos",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className='flex justify-center items-center bg-background h-full'>
      <Card className='p-1'>
        <CardHeader>
          <CardTitle>Inicia Sesión</CardTitle>
          <CardDescription>
            Aún no te has registrado?{" "}
            <Link className='text-ring' href='/signup'>
              Registrate
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={signInSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await onFormSubmit(values, setSubmitting);
              router.push("/");
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

export default SignInForm;
