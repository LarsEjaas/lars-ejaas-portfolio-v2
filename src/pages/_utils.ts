import type { PaginateFunction } from 'astro';
import type { DanishLanguageSlug } from '@i18n/settings';
import type { DanishModalKey, ModalKey } from '@i18n/routes';

export function paginateWithModals<
  T,
  L extends DanishLanguageSlug | undefined = undefined,
>({
  items,
  paginate,
  pageSize,
  modals,
  lang,
}: {
  items: T[];
  paginate: PaginateFunction;
  pageSize: number;
  modals: L extends DanishLanguageSlug
    ? readonly DanishModalKey[]
    : readonly ModalKey[];
  lang?: L;
}) {
  type ModalType = L extends DanishLanguageSlug ? DanishModalKey : ModalKey;

  const modalArray = modals;

  return modalArray.flatMap((modal) =>
    paginate(items, {
      params: {
        ...(lang ? { lang } : {}),
        modal,
      },
      pageSize,
    }).map((base) => ({
      params: { ...base.params, modal } as {
        modal: ModalType;
      } & typeof base.params,
      props: { ...base.props, modal } as {
        modal: ModalType;
      } & typeof base.props,
    }))
  );
}
