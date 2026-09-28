import React, { type ReactElement } from 'react';
import { t } from '@grafana/i18n';
import { Button, Dropdown, Menu, linkModelToContextMenuItems } from '@grafana/ui';
import { type LinkModel } from '@grafana/data';

type Props = {
  getLinks: () => LinkModel[];
  title: string;
  onVisibleChange?: (visible: boolean) => void;
  'data-testid'?: string;
};

export function StepLinksMenu(props: Props): ReactElement {
  const { getLinks, title, onVisibleChange } = props;
  const label = t('components.flow.links-menu', 'Data links for {{title}}', { title });

  // Resolve the links when the menu opens, so variables are interpolated on demand.
  const renderMenu = () => (
    <Menu>
      {linkModelToContextMenuItems(getLinks).map((item, i) => (
        <Menu.Item
          key={`${item.label}-${i}`}
          label={item.label}
          ariaLabel={item.ariaLabel}
          url={item.url}
          target={item.target}
          icon={item.icon}
          onClick={item.onClick}
        />
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={renderMenu} placement="bottom-end" onVisibleChange={onVisibleChange}>
      <Button
        aria-label={label}
        title={label}
        icon="ellipsis-v"
        variant="secondary"
        size="sm"
        data-testid={props['data-testid']}
      />
    </Dropdown>
  );
}
