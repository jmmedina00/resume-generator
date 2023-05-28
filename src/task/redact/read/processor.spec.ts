import { RedactContext } from '../../context';
import { readIntoLocalState, readIntoRemoteState } from './processor';

describe('Redact processors', () => {
  const initialContext: RedactContext = {
    localState: '',
    remoteState: '',
  };

  it('should read into local state', () => {
    const state = 'local state';
    const context = { ...initialContext };
    const expectedFinalContext = {
      ...initialContext,
      localState: 'local state',
    };

    readIntoLocalState(state, context);
    expect(context).toEqual(expectedFinalContext);
  });

  it('should read into remote state', () => {
    const state = 'RemOTestate';
    const context = { ...initialContext };
    const expectedFinalContext = {
      ...initialContext,
      remoteState: 'RemOTestate',
    };

    readIntoRemoteState(state, context);
    expect(context).toEqual(expectedFinalContext);
  });
});
