import { zodResolver } from '@hookform/resolvers/zod';
import { FieldValues, Resolver, useForm, UseFormProps } from 'react-hook-form';
import { ZodType } from 'zod';

type UseZodFormProps<T extends FieldValues> = Omit<UseFormProps<T>, 'resolver'> & {
    schema: ZodType<T>;
};

/**
 * Thin wrapper around `useForm` that wires up the zod resolver and the defaults
 * we want for every form in the app:
 * - `mode: 'onTouched'` so inline errors appear once a field has been interacted with.
 * - `resetOptions.keepDirtyValues` so background data refreshes (e.g. SWR revalidation)
 *   passed through the `values` prop don't clobber what the user is currently editing.
 *
 * Pass server/props data via `values` (reactive) rather than `defaultValues` so the
 * form re-syncs automatically when the source data changes.
 */
const useZodForm = <T extends FieldValues>({ schema, ...formProps }: UseZodFormProps<T>) =>
    useForm<T>({
        // The public `schema` type (ZodType<T>) leaves the zod input as `unknown`, which the
        // resolver's zod-4 overload rejects (it needs `Input extends FieldValues`). Pin the input
        // to T at this boundary; for our schemas the input and output shapes match.
        resolver: zodResolver(schema as ZodType<T, T>) as Resolver<T>,
        mode: 'onTouched',
        resetOptions: { keepDirtyValues: true },
        ...formProps,
    });

export default useZodForm;
