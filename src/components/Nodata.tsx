import { css } from '@emotion/css';
import { type GrafanaTheme2 } from '@grafana/data';
import { t } from '@grafana/i18n';
import { useStyles2 } from '@grafana/ui';
import React, { type ReactElement } from 'react';
import { Center } from './Center';

export function Nodata(): ReactElement {
  const styles = useStyles2(getStyles);

  return (
    <Center>
      <p className={styles.text}>{t('components.nodata.message', 'No data')}</p>
    </Center>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    text: css({
      color: theme.colors.text.secondary,
      fontSize: '18px',
      margin: 0,
    }),
  };
};
