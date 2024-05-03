"use client";

import { Form as FormikForm, Formik, Field } from "formik";
import { AnySchema, object, string } from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shadcnui/card";
import { Button } from "@shadcnui/button";
import CustomField from "@molecules/CustomField";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/services/authService";

interface SignUpFormValues {
  name: string;
  email: string;
  emailConfirmation: string;
  password: string;
  passwordConfirmation: string;
}

const signUpSchema = object<Record<keyof SignUpFormValues, AnySchema>>({
  name: string().required("El nombre es requerido"),
  email: string()
    .email("El email no es válido")
    .required("El email es requerido"),
  emailConfirmation: string()
    .email("El email no es válido")
    .test("email-match", "Los correos deben coincidir", function (value) {
      return this.parent.email === value;
    }),
  password: string().required("Password is required"),
  passwordConfirmation: string().test(
    "passwords-match",
    "Las contraseñas deben coincidir",
    function (value) {
      return this.parent.password === value;
    }
  ),
});

const fields = [
  {
    initialValue: "",
    label: "Nombre",
    name: "name",
    type: "text",
  },
  {
    initialValue: "",
    label: "Correo",
    name: "email",
    type: "email",
  },
  {
    initialValue: "",
    label: "Confirmar correo",
    name: "emailConfirmation",
    type: "email",
  },
  {
    initialValue: "",
    label: "Contraseña",
    name: "password",
    type: "password",
  },
  {
    initialValue: "",
    label: "Confirmar Contraseña",
    name: "passwordConfirmation",
    type: "password",
  },
];

const onFormSubmit = (
  values: SignUpFormValues,
  setSubmitting: (isSubmitting: boolean) => void
) => {
  signUp(values.email, values.password).then(async (commandOutput) => {
    console.log(commandOutput);
    setSubmitting(false);
  });
};

const SignUpForm: React.FC = () => {
  const router = useRouter();
  return (
    <div className='flex justify-center items-center bg-background h-full'>
      <Card className='p-1'>
        <CardHeader>
          <CardTitle>Crea una cuenta</CardTitle>
          <CardDescription>
            Tienes cuenta?{" "}
            <Link className='text-ring' href='/signin'>
              Inicia Sesión
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Formik
            initialValues={{
              name: "",
              email: "",
              emailConfirmation: "",
              password: "",
              passwordConfirmation: "",
            }}
            validationSchema={signUpSchema}
            onSubmit={(values, { setSubmitting }) => {
              onFormSubmit(values, setSubmitting);
              router.push("/confirmation");
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

                <Button
                  type='submit'
                  className='mt-10 text-foreground'
                  disabled={isSubmitting}
                >
                  Registrarse
                </Button>
              </FormikForm>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpForm;
