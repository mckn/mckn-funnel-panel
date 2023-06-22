import React, { PropsWithChildren, ReactElement, ReactNode, createContext, useContext, useEffect, useRef } from 'react';
import { useTheme2 } from '@grafana/ui';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { nanoid } from 'nanoid';

type TooltipContextType = {
  id: string;
};

const TooltipContext = createContext<TooltipContextType | null>(null);

export function TooltipProvider(props: PropsWithChildren): ReactElement {
  const { children } = props;
  const theme = useTheme2();
  const variant = theme.isDark ? 'light' : 'dark';
  const tooltipRef = useRef(nanoid());

  return (
    <TooltipContext.Provider value={{ id: tooltipRef.current }}>
      {children}
      <ReactTooltip
        id={tooltipRef.current}
        variant={variant}
        noArrow={true}
        float={true}
        place="right"
        render={({ content }) => {
          if (content === null) {
            return null;
          }
          return contentRegistry[content] ?? null;
        }}
      />
    </TooltipContext.Provider>
  );
}

type TooltipPropsResult = {
  'data-tooltip-content': string | undefined;
  'data-tooltip-id': string | undefined;
};

type TooltipPropsOptions = {
  content: ReactNode;
};

const contentRegistry: Record<string, ReactNode> = {};

export function useTooltipProps(options: TooltipPropsOptions): TooltipPropsResult {
  const { content } = options;
  const context = useContext(TooltipContext);
  const contentRef = useRef(nanoid());

  useEffect(() => {
    const contentId = contentRef.current;
    contentRegistry[contentId] = content;

    return () => {
      delete contentRegistry[contentId];
    };
  }, [content, contentRef]);

  return {
    'data-tooltip-id': context?.id,
    'data-tooltip-content': contentRef.current,
  };
}
