import { useEffect, useRef } from 'react';
import createBallpit from './ballpit-core';

const Ballpit = ({ followCursor = true, ...props }) => {
  const canvasRef = useRef(null);
  const instance = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    instance.current = createBallpit(canvas, { followCursor, ...props });
    return () => instance.current?.dispose();
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default Ballpit; 