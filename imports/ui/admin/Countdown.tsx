import React, { useEffect, useState } from 'react';

interface CountdownProps {
  end: Date;
}

const pad = (n: number) => n.toString().padStart(2, '0');

const Countdown: React.FC<CountdownProps> = ({ end }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(end));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(end));
    }, 1000);
    return () => clearInterval(timer);
  }, [end]);

  if (timeLeft.total <= 0) {
    return <span>00 DAYS 00 HOURS 00 MINS</span>;
  }

  return (
    <span>
      <span>{pad(timeLeft.days)}</span> DAYS{' '}
      <span>{pad(timeLeft.hours)}</span> HOURS{' '}
      <span>{pad(timeLeft.minutes)}</span> MINS
    </span>
  );
};

function getTimeLeft(end: Date) {
  const total = Math.max(0, end.getTime() - Date.now());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  return { total, days, hours, minutes };
}

export default Countdown;
