type FieldError = string | null;

type FormFieldsError = {
  name: FieldError,
  symbol: FieldError,
  description: FieldError,
  metadata_uri: FieldError,
  image: FieldError,
}

export default function FieldErrorMessage({name, formErrors}: { name: string, formErrors: FormFieldsError }) {

  if (!formErrors[name]) {
    return null;
  }
  return (
      <p className="text-red-500">
        {formErrors[name]}
      </p>
  );
}