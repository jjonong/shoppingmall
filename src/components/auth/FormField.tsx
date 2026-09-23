type Props = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  placeholder?: string;
  errors?: string[];
};

export default function FormField({ label, name, errors, ...inputProps }: Props) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={!!errors?.length}
        aria-describedby={errors?.length ? errorId : undefined}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black aria-invalid:border-red-500"
        {...inputProps}
      />
      {errors?.length ? (
        <ul id={errorId} className="mt-1 space-y-0.5 text-sm text-red-600">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
