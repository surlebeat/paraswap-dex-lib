import { Interface } from '@ethersproject/abi';
import { DeepReadonly } from 'ts-essentials';
import { Log, Logger } from '../../types';
import { StatefulEventSubscriber } from '../../stateful-event-subscriber';
import { IDexHelper } from '../../dex-helper/idex-helper';
import { IntegralPoolState } from './types';
import IntegralRelayerABI from '../../abi/integral/relayer.json';

export class IntegralEventPool extends StatefulEventSubscriber<IntegralPoolState> {
  handlers: {
    [event: string]: (
      event: any,
      pool: DeepReadonly<IntegralPoolState>,
      log: Log,
    ) => IntegralPoolState;
  } = {};

  logDecoder: (log: Log) => any;

  addressesSubscribed: string[];

  constructor(
    protected parentName: string,
    protected network: number,
    protected dexHelper: IDexHelper,
    logger: Logger,
    protected integralIface = new Interface(IntegralRelayerABI), // TODO: add any additional params required for event subscriber
  ) {
    super(parentName, logger);

    // TODO: make logDecoder decode logs that
    this.logDecoder = (log: Log) => this.integralIface.parseLog(log);
    this.addressesSubscribed = [
      /* subscribed addresses */
    ];
  }

  /**
   * The function is called every time any of the subscribed
   * addresses release log. The function accepts the current
   * state, updates the state according to the log, and returns
   * the updated state.
   * @param state - Current state of event subscriber
   * @param log - Log released by one of the subscribed addresses
   * @returns Updates state of the event subscriber after the log
   */
  protected processLog(
    state: DeepReadonly<IntegralPoolState>,
    log: Readonly<Log>,
  ): DeepReadonly<IntegralPoolState> | null {
    try {
      const event = this.logDecoder(log);
      if (event.name in this.handlers) {
        return this.handlers[event.name](event, state, log);
      }
      return state;
    } catch (e) {
      this.logger.error(
        `Error_${this.parentName}_processLog could not parse the log with topic ${log.topics}:`,
        e,
      );
      return null;
    }
  }

  /**
   * The function generates state using on-chain calls. This
   * function is called to regenerate state if the event based
   * system fails to fetch events and the local state is no
   * more correct.
   * @param blockNumber - Blocknumber for which the state should
   * should be generated
   * @returns state of the event subscriber at blocknumber
   */
  async generateState(
    blockNumber: number,
  ): Promise<Readonly<IntegralPoolState>> {
    // TODO: complete me!
    // const [reserve0, reserve1, price, mintFee, burnFee, swapFee] = [0,0,0,0,0,0].map((n) => BigInt(n))
    // return {exists: true, reserve0, reserve1, price, mintFee, burnFee, swapFee}
    return { price: 1n, invertedPrice: 2n, fee: 3n, limits0: [0n, 0n], limits1: [0n, 0n] };
  }
}