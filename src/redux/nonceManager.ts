import {
  getNonceManager,
  saveNonceManager,
} from '../handlers/localstorage/nonceManager';
import { AppDispatch, AppGetState } from './store';
import { Network } from '@rainbow-me/helpers/networkTypes';

interface NetworkNonceInfo {
  nonce: number;
}
interface AccountNonceInfo {
  [key: string]: NetworkNonceInfo;
}

interface NonceManager {
  [key: string]: AccountNonceInfo;
}

interface NonceManagerUpdate {
  network: string;
  account: string;
  nonce: number;
}

interface NonceManagerLoadSuccessAction {
  type: typeof NONCE_MANAGER_LOAD_SUCCESS;
  payload: NonceManager;
}

interface NonceManagerUpdateNonceAction {
  type: typeof NONCE_MANAGER_UPDATE_NONCE;
  payload: NonceManagerUpdate;
}

export type NonceManagerActionType =
  | NonceManagerLoadSuccessAction
  | NonceManagerUpdateNonceAction;

// -- Constants --------------------------------------- //
const NONCE_MANAGER_LOAD_SUCCESS = 'NONCE_MANAGER_LOAD_SUCCESS';
const NONCE_MANAGER_LOAD_FAILURE = 'NONCE_MANAGER_LOAD_FAILURE';
const NONCE_MANAGER_UPDATE_NONCE = 'NONCE_MANAGER_UPDATE_NONCE';

// -- Helpers --------------------------------------- //
const getCurrentNonce = (
  getState: AppGetState,
  params: NonceManagerUpdate
): [number, NonceManager] => {
  const { nonceManager } = getState();
  const { account, network } = params;
  let currentNonceData: NonceManager = { ...nonceManager };
  const currentNonce = currentNonceData[account]?.[network]?.nonce;
  return [currentNonce, currentNonceData];
};

const updateNonce = (
  dispatch: AppDispatch,
  nonceData: NonceManager,
  params: NonceManagerUpdate
) => {
  const { account, network, nonce } = params;
  dispatch({ payload: params, type: NONCE_MANAGER_UPDATE_NONCE });
  saveNonceManager({
    ...nonceData,
    [account]: {
      ...(nonceData[account] || {}),
      [network]: { nonce },
    },
  });
};

// -- Actions ---------------------------------------- //
export const nonceManagerLoadState = () => async (dispatch: AppDispatch) => {
  try {
    const nonceManager = await getNonceManager();
    if (nonceManager) {
      dispatch({
        payload: nonceManager,
        type: NONCE_MANAGER_LOAD_SUCCESS,
      });
    }
  } catch (error) {
    dispatch({ type: NONCE_MANAGER_LOAD_FAILURE });
  }
};

export const incrementNonce = (
  account: string,
  nonce: number,
  network?: string
) => (dispatch: AppDispatch, getState: AppGetState) => {
  const nonceParams = {
    account,
    network: network || Network.mainnet,
    nonce,
  };
  const [currentNonce, currentNonceData] = getCurrentNonce(
    getState,
    nonceParams
  );
  const nonceCounterExists = !!currentNonce;
  const counterShouldBeIncremented = currentNonce < nonce;

  if (!nonceCounterExists || counterShouldBeIncremented) {
    updateNonce(dispatch, currentNonceData, nonceParams);
  }
};

export const decrementNonce = (
  account: string,
  nonce: number,
  network?: string
) => (dispatch: AppDispatch, getState: AppGetState) => {
  const ntwrk = network || Network.mainnet;
  let [currentNonce, currentNonceData] = getCurrentNonce(getState, {
    account,
    network: ntwrk,
    nonce,
  });
  const nonceCounterExists = !!currentNonce;
  const counterShouldBeDecremented = currentNonce >= nonce;

  if (!nonceCounterExists || counterShouldBeDecremented) {
    const decrementedNonce = nonce - 1;
    updateNonce(dispatch, currentNonceData, {
      account,
      network: ntwrk,
      nonce: decrementedNonce,
    });
  }
};

// -- Reducer ----------------------------------------- //
const INITIAL_STATE = {};

export default (state = INITIAL_STATE, action: NonceManagerActionType) => {
  switch (action.type) {
    case NONCE_MANAGER_LOAD_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };
    case NONCE_MANAGER_UPDATE_NONCE:
      return {
        ...state,
        [action.payload.account]: {
          [action.payload.network]: {
            nonce: action.payload.nonce,
          },
        },
      };
    default:
      return state;
  }
};
