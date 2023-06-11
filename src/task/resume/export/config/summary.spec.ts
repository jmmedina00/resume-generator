import { TaskYielder } from '../../../render';
import { getLocalAssetGatheringYielder } from '../../../render/assets';
import { bufferContextResource } from '../../../render/buffer';
import {
  addParserWithPrettyOptions,
  prettifyResource,
} from '../../../render/shared';
import { YielderSummary, makeYieldersFromSummary } from './summary';

jest.mock('../../../render/assets');
jest.mock('../../../render/buffer');
jest.mock('../../../render/shared');

describe('Config yielder summary', () => {
  (bufferContextResource as jest.Mock).mockImplementation(
    (bufferer, point) => ({ bufferer, point })
  );
  (getLocalAssetGatheringYielder as jest.Mock).mockImplementation((assets) => ({
    assets,
  }));
  (addParserWithPrettyOptions as jest.Mock).mockImplementation((parser) => ({
    parser,
  }));
  (prettifyResource as jest.Mock).mockImplementation((resource) => ({
    resource,
  }));

  it('should generate complete yielder collection including Prettier ones', () => {
    const bufferer = jest.fn();

    const summary: YielderSummary = {
      assets: { foo: 'bar', bar: 'baz' },
      prettier: {
        parser: 'json',
        formatPoint: 'prettyme',
      },
      bufferer,
      bufferPoint: 'now',
    };

    const additionalYielders = [{ re: 'la' }];

    const expectedYielders = [
      {
        assets: { foo: 'bar', bar: 'baz' },
      },
      { parser: 'json' },
      { re: 'la' },
      { resource: 'prettyme' },
      { bufferer, point: 'now' },
    ];

    const yielders = makeYieldersFromSummary(
      summary,
      additionalYielders as unknown as TaskYielder[]
    );
    expect(yielders).toEqual(expectedYielders);
  });
  it('should generate complete yielder collection excluding Prettier ones', () => {
    const bufferer = jest.fn();

    const summary: YielderSummary = {
      assets: { foo: 'bar', bar: 'baz' },
      bufferer,
      bufferPoint: 'now',
    };

    const additionalYielders = [{ re: 'la' }];

    const expectedYielders = [
      {
        assets: { foo: 'bar', bar: 'baz' },
      },
      { re: 'la' },
      { bufferer, point: 'now' },
    ];

    const yielders = makeYieldersFromSummary(
      summary,
      additionalYielders as unknown as TaskYielder[]
    );
    expect(yielders).toEqual(expectedYielders);
  });
});
