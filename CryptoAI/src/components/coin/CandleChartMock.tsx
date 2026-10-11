import React from 'react';
import { CryptoAsset } from '../../types/crypto';
import { TradingViewChart, Timeframe } from './TradingViewChart';

interface Props {
  coin: CryptoAsset;
  timeframe?: string;
  onTimeframeChange?: (tf: Timeframe) => void;
}

export const CandleChartMock: React.FC<Props> = ({
  coin,
  timeframe = '1h',
  onTimeframeChange,
}) => {
  const validTf = (['15m', '1h', '4h', '1D'].includes(timeframe)
    ? timeframe
    : '1h') as Timeframe;

  return (
    <TradingViewChart
      coin={coin}
      timeframe={validTf}
      onTimeframeChange={onTimeframeChange}
    />
  );
};
