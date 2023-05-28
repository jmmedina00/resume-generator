import { RedactContext } from '../../context';
import { Processor } from '../../io/read';

export const readIntoLocalState: Processor<RedactContext, string> = (
  data,
  context
) => {
  context.localState = data;
};

export const readIntoRemoteState: Processor<RedactContext, string> = (
  data,
  context
) => {
  context.remoteState = data;
};
