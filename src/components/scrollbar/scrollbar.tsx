import SimpleBar from 'simplebar-react';
import { useRef, useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';

import { scrollbarClasses } from './classes';

import type { ScrollbarProps } from './types';

// ----------------------------------------------------------------------

export function Scrollbar({
  sx,
  ref,
  children,
  className,
  slotProps,
  fillContent = true,
  ...other
}: ScrollbarProps) {
  const simpleBarRef = useRef<any>(null);

  useEffect(() => {
    const scrollElement = simpleBarRef.current?.getScrollElement();
    if (!scrollElement) return;

    let isDown = false;
    let startX: number, scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - scrollElement.offsetLeft;
      scrollLeft = scrollElement.scrollLeft;
      scrollElement.classList.add('active-grab');
    };

    const handleMouseLeave = () => {
      isDown = false;
      scrollElement.classList.remove('active-grab');
    };

    const handleMouseUp = () => {
      isDown = false;
      scrollElement.classList.remove('active-grab');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollElement.offsetLeft;
      const walk = (x - startX) * 1; // scroll speed
      scrollElement.scrollLeft = scrollLeft - walk;
    };

    scrollElement.addEventListener('mousedown', handleMouseDown);
    scrollElement.addEventListener('mouseleave', handleMouseLeave);
    scrollElement.addEventListener('mouseup', handleMouseUp);
    scrollElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      scrollElement.removeEventListener('mousedown', handleMouseDown);
      scrollElement.removeEventListener('mouseleave', handleMouseLeave);
      scrollElement.removeEventListener('mouseup', handleMouseUp);
      scrollElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <ScrollbarRoot
      ref={simpleBarRef}
      scrollableNodeProps={{ ref }}
      clickOnTrack={false}
      fillContent={fillContent}
      className={mergeClasses([scrollbarClasses.root, className])}
      sx={[
        {
          '& .simplebar-wrapper': slotProps?.wrapperSx as React.CSSProperties,
          '& .simplebar-content-wrapper': slotProps?.contentWrapperSx as React.CSSProperties,
          '& .simplebar-content': slotProps?.contentSx as React.CSSProperties,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </ScrollbarRoot>
  );
}

// ----------------------------------------------------------------------

const ScrollbarRoot = styled(SimpleBar, {
  shouldForwardProp: (prop: string) => !['fillContent', 'sx'].includes(prop),
})<Pick<ScrollbarProps, 'fillContent'>>(({ fillContent }) => ({
  minWidth: 0,
  minHeight: 0,
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  ...(fillContent && {
    '& .simplebar-content': {
      display: 'flex',
      flex: '1 1 auto',
      minHeight: '100%',
      flexDirection: 'column',
    },
  }),
}));
