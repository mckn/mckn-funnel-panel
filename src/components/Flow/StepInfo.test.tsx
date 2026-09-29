import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createTheme, type DisplayValue, type LinkModel } from '@grafana/data';
import { OutcomeDirection } from 'types';
import { type StepComparison } from '../../data/comparison';
import { StepInfo } from './StepInfo';

const value: DisplayValue = { text: '52300', numeric: 52300, title: 'Sent', percent: 1, color: '#73BF69' };

const links: LinkModel[] = [
  { title: 'Show Sent details', href: '/d/details?step=Sent', target: '_self', origin: {} },
  { title: 'Search for Sent', href: 'https://grafana.com/search/?query=Sent', target: '_blank', origin: {} },
];

function renderStep(getLinks?: () => LinkModel[]) {
  return render(
    <StepInfo
      value={value}
      index={0}
      compact={false}
      alignTop={false}
      highlighted={false}
      onMouseEnter={jest.fn()}
      onMouseLeave={jest.fn()}
      showRemainedPercentage={false}
      getLinks={getLinks}
    />
  );
}

describe('StepInfo', () => {
  it('does not render the links menu when the step has no data links', () => {
    renderStep();

    expect(screen.queryByTestId('menu-0')).not.toBeInTheDocument();
  });

  it('resolves the links only when the menu opens', () => {
    const getLinks = jest.fn(() => links);
    renderStep(getLinks);

    expect(screen.getByTestId('menu-0')).toBeInTheDocument();
    expect(getLinks).not.toHaveBeenCalled();
  });

  it('lists every data link when the menu opens', () => {
    renderStep(() => links);

    fireEvent.click(screen.getByTestId('menu-0'));

    const details = screen.getByLabelText('Show Sent details');
    const search = screen.getByLabelText('Search for Sent');

    expect(details).toHaveAttribute('href', '/d/details?step=Sent');
    expect(search).toHaveAttribute('href', 'https://grafana.com/search/?query=Sent');
    expect(search).toHaveAttribute('target', '_blank');
  });
});

const sent: DisplayValue = { text: '100', numeric: 100, title: 'Sent', percent: 1, color: '#73BF69' };
const viewed: DisplayValue = { text: '70', numeric: 70, title: 'Viewed', percent: 0.7, color: '#73BF69' };

describe('StepInfo with a comparison', () => {
  const theme = createTheme();
  const comparison: StepComparison = {
    count: 70,
    comparedCount: 160,
    comparedValue: { text: '160', numeric: 160 },
    countDelta: -90,
    countDeltaPercent: -0.5625,
    stepRate: 0.7,
    comparedStepRate: 0.8,
  };

  function renderComparison(props: Partial<React.ComponentProps<typeof StepInfo>> = {}) {
    return render(
      <StepInfo
        value={viewed}
        previous={sent}
        index={1}
        compact={false}
        alignTop={false}
        highlighted={false}
        onMouseEnter={jest.fn()}
        onMouseLeave={jest.fn()}
        showRemainedPercentage={false}
        comparison={comparison}
        outcomeDirection={OutcomeDirection.higher}
        {...props}
      />
    );
  }

  function valueOf(testId: string): HTMLElement {
    return screen.getByTestId(testId).firstElementChild as HTMLElement;
  }

  it('does not render the changes without a comparison', () => {
    renderComparison({ comparison: undefined });

    expect(screen.queryByTestId('count-change-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('conversion-change-1')).not.toBeInTheDocument();
  });

  it('shows the count change and the compared count', () => {
    renderComparison();

    expect(screen.getByTestId('count-change-1')).toHaveTextContent('−90 (−56.25%)vs 160');
    expect(valueOf('count-change-1')).toHaveStyle({ color: theme.colors.error.text });
  });

  it('shows the drop-off change with the color of the conversion change', () => {
    renderComparison();

    // Drop-off goes from 20% to 30%, that is a lower conversion.
    expect(screen.getByTestId('conversion-change-1')).toHaveTextContent('+10 ppvs 20%');
    expect(valueOf('conversion-change-1')).toHaveStyle({ color: theme.colors.error.text });
  });

  it('shows the retention change when showing the retention rate', () => {
    renderComparison({ showRemainedPercentage: true });

    expect(screen.getByTestId('conversion-change-1')).toHaveTextContent('−10 ppvs 80%');
  });

  it('shows decreases as favorable when a lower outcome is favorable', () => {
    renderComparison({ outcomeDirection: OutcomeDirection.lower });

    expect(valueOf('count-change-1')).toHaveStyle({ color: theme.colors.success.text });
    expect(valueOf('conversion-change-1')).toHaveStyle({ color: theme.colors.success.text });
  });

  it('leaves out the compared values in compact steps', () => {
    renderComparison({ compact: true });

    expect(screen.getByTestId('count-change-1')).toHaveTextContent(/^−90 \(−56\.25%\)$/);
    expect(screen.getByTestId('conversion-change-1')).toHaveTextContent(/^\+10 pp$/);
  });

  it('does not show a conversion change for the first step', () => {
    renderComparison({ previous: undefined, index: 0 });

    expect(screen.getByTestId('count-change-0')).toBeInTheDocument();
    expect(screen.queryByTestId('conversion-change-0')).not.toBeInTheDocument();
  });
});
