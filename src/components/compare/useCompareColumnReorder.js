import { useCallback, useRef, useState } from 'react';

const DRAG_THRESHOLD = 6;

// 헤더 전체를 포인터 핸들로 사용하되, 탭/클릭과 드래그를 이동 거리로 구분한다.
export function useCompareColumnReorder({ products, onReorder }) {
  const sourceIdRef = useRef(null);
  const targetIdRef = useRef(null);
  const dropPositionRef = useRef('before');
  const startXRef = useRef(0);
  const didDragRef = useRef(false);
  const [draggedId, setDraggedId] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [dropPosition, setDropPosition] = useState('before');
  const [dragOffsetX, setDragOffsetX] = useState(0);

  const resetVisualState = useCallback(() => {
    sourceIdRef.current = null;
    targetIdRef.current = null;
    setDraggedId(null);
    setTargetId(null);
    setDropPosition('before');
    setDragOffsetX(0);
  }, []);

  const handlePointerDown = useCallback((event, productId) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest('button[class$="-col-x"]')) return;
    sourceIdRef.current = productId;
    targetIdRef.current = productId;
    dropPositionRef.current = 'before';
    startXRef.current = event.clientX;
    didDragRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (sourceIdRef.current == null) return;
    const offsetX = event.clientX - startXRef.current;
    if (!didDragRef.current && Math.abs(offsetX) < DRAG_THRESHOLD) return;

    if (!didDragRef.current) {
      didDragRef.current = true;
      setDraggedId(sourceIdRef.current);
      setTargetId(sourceIdRef.current);
    }
    event.preventDefault();
    setDragOffsetX(offsetX);

    const element = document.elementFromPoint(event.clientX, event.clientY);
    const column = element?.closest?.('[data-compare-product-id]');
    const nextId = column?.dataset.compareProductId;
    if (!nextId) return;
    const rect = column.getBoundingClientRect();
    const nextPosition = event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
    targetIdRef.current = nextId;
    dropPositionRef.current = nextPosition;
    setTargetId(nextId);
    setDropPosition(nextPosition);
  }, []);

  const handlePointerUp = useCallback((event) => {
    const sourceId = sourceIdRef.current;
    const destinationId = targetIdRef.current;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (
      didDragRef.current
      && sourceId != null
      && destinationId != null
      && String(sourceId) !== String(destinationId)
    ) {
      onReorder(sourceId, destinationId, dropPositionRef.current);
    }
    resetVisualState();
  }, [onReorder, resetVisualState]);

  const handleClickCapture = useCallback((event) => {
    if (!didDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    didDragRef.current = false;
  }, []);

  const handleKeyDown = useCallback((event, productId) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const index = products.findIndex((product) => String(product.id) === String(productId));
    const adjacent = products[index + (event.key === 'ArrowLeft' ? -1 : 1)];
    if (!adjacent) return;
    event.preventDefault();
    onReorder(productId, adjacent.id, event.key === 'ArrowLeft' ? 'before' : 'after');
  }, [onReorder, products]);

  const getColumnProps = useCallback((productId) => ({
    onPointerDown: (event) => handlePointerDown(event, productId),
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: resetVisualState,
    onClickCapture: handleClickCapture,
    onKeyDown: (event) => handleKeyDown(event, productId),
  }), [handleClickCapture, handleKeyDown, handlePointerDown, handlePointerMove, handlePointerUp, resetVisualState]);

  return { draggedId, targetId, dropPosition, dragOffsetX, getColumnProps };
}
