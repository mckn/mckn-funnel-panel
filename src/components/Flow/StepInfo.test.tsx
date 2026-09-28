import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { type DisplayValue, type LinkModel } from '@grafana/data';
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
