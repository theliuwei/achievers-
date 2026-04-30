import i18n from '../../i18n'
import type { ActionIconType } from './ActionIcon'

/** Action icon labels used by tooltip/title/aria-label */
export const ACTION_ICON_LABELS: Record<ActionIconType, string> = {
  query: i18n.t('common:actions.search'),
  add: i18n.t('common:adminTable.actions.create'),
  edit: i18n.t('common:adminTable.edit'),
  delete: i18n.t('common:adminTable.delete'),
  refresh: i18n.t('common:actions.refresh'),
}
