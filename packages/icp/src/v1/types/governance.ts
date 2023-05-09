import { Principal } from '../utils/principal'
import * as IDL from '../utils/idl'
import { DelegateeDetails, DelegationDetails, DelegatorDetails } from '@airgap/coinlib-core'

export enum ICPStakingActionType {
  GET_STAKING_DETAILS = 'GET_STAKING_DETAILS',
  STAKE_AND_FOLLOW = 'STAKE_AND_FOLLOW',
  FOLLOW = 'FOLLOW',
  REFRESH_NEURON = 'REFRESH_NEURON',
  INCREASE_DISSOLVE_DELAY = 'INCREASE_DISSOLVE_DELAY',
  START_DISSOLVING = 'START_DISSOLVING',
  STOP_DISSOLVING = 'STOP_DISSOLVING',
  DISBURSE_AND_UNFOLLOW = 'DISBURSE_AND_UNFOLLOW'
}

export interface ICPDelegatorDetails extends DelegatorDetails {
  subaccountBalance: string
  stake?: string
  votingPower?: string
  age?: string
  dissolveDelay?: string
  maturity?: string
}

export interface ICPDelegateeDetails extends DelegateeDetails {
  status: 'unknown' | 'followed' | 'not-followed'
  votingPower: string
}

export interface ICPDelegationDetails extends DelegationDetails {
  delegator: ICPDelegatorDetails
  delegatees: ICPDelegateeDetails[]
}

export interface AccountIdentifier {
  hash: Uint8Array
}
export type Action =
  | { RegisterKnownNeuron: KnownNeuron }
  | { ManageNeuron: ManageNeuron }
  | { ExecuteNnsFunction: ExecuteNnsFunction }
  | { RewardNodeProvider: RewardNodeProvider }
  | { OpenSnsTokenSwap: OpenSnsTokenSwap }
  | { SetSnsTokenSwapOpenTimeWindow: SetSnsTokenSwapOpenTimeWindow }
  | { SetDefaultFollowees: SetDefaultFollowees }
  | { RewardNodeProviders: RewardNodeProviders }
  | { ManageNetworkEconomics: NetworkEconomics }
  | { ApproveGenesisKyc: ApproveGenesisKyc }
  | { AddOrRemoveNodeProvider: AddOrRemoveNodeProvider }
  | { Motion: Motion }
export interface AddHotKey {
  new_hot_key: [] | [Principal]
}
export interface AddOrRemoveNodeProvider {
  change: [] | [Change]
}
export interface Amount {
  e8s: bigint
}
export interface ApproveGenesisKyc {
  principals: Array<Principal>
}
export interface Ballot {
  vote: number
  voting_power: bigint
}
export interface BallotInfo {
  vote: number
  proposal_id: [] | [NeuronId]
}
export type By = { NeuronIdOrSubaccount: {} } | { MemoAndController: ClaimOrRefreshNeuronFromAccount } | { Memo: bigint }
export interface CfNeuron {
  nns_neuron_id: bigint
  amount_icp_e8s: bigint
}
export interface CfParticipant {
  hotkey_principal: string
  cf_neurons: Array<CfNeuron>
}
export type Change = { ToRemove: NodeProvider } | { ToAdd: NodeProvider }
export interface ChangeAutoStakeMaturity {
  requested_setting_for_auto_stake_maturity: boolean
}
export interface ClaimOrRefresh {
  by: [] | [By]
}
export interface ClaimOrRefreshNeuronFromAccount {
  controller: [] | [Principal]
  memo: bigint
}
export interface ClaimOrRefreshNeuronFromAccountResponse {
  result: [] | [Result_1]
}
export interface ClaimOrRefreshResponse {
  refreshed_neuron_id: [] | [NeuronId]
}
export type Command =
  | { Spawn: Spawn }
  | { Split: Split }
  | { Follow: Follow }
  | { ClaimOrRefresh: ClaimOrRefresh }
  | { Configure: Configure }
  | { RegisterVote: RegisterVote }
  | { Merge: Merge }
  | { DisburseToNeuron: DisburseToNeuron }
  | { MakeProposal: Proposal }
  | { StakeMaturity: StakeMaturity }
  | { MergeMaturity: MergeMaturity }
  | { Disburse: Disburse }
export type Command_1 =
  | { Error: GovernanceError }
  | { Spawn: SpawnResponse }
  | { Split: SpawnResponse }
  | { Follow: {} }
  | { ClaimOrRefresh: ClaimOrRefreshResponse }
  | { Configure: {} }
  | { RegisterVote: {} }
  | { Merge: {} }
  | { DisburseToNeuron: SpawnResponse }
  | { MakeProposal: MakeProposalResponse }
  | { StakeMaturity: StakeMaturityResponse }
  | { MergeMaturity: MergeMaturityResponse }
  | { Disburse: DisburseResponse }
export type Command_2 =
  | { Spawn: NeuronId }
  | { Split: Split }
  | { Configure: Configure }
  | { Merge: Merge }
  | { DisburseToNeuron: DisburseToNeuron }
  | { SyncCommand: {} }
  | { ClaimOrRefreshNeuron: ClaimOrRefresh }
  | { MergeMaturity: MergeMaturity }
  | { Disburse: Disburse }
export interface Committed {
  sns_governance_canister_id: [] | [Principal]
}
export interface Configure {
  operation: [] | [Operation]
}
export interface Disburse {
  to_account: [] | [AccountIdentifier]
  amount: [] | [Amount]
}
export interface DisburseResponse {
  transfer_block_height: bigint
}
export interface DisburseToNeuron {
  dissolve_delay_seconds: bigint
  kyc_verified: boolean
  amount_e8s: bigint
  new_controller: [] | [Principal]
  nonce: bigint
}
export type DissolveState = { DissolveDelaySeconds: bigint } | { WhenDissolvedTimestampSeconds: bigint }
export interface ExecuteNnsFunction {
  nns_function: number
  payload: Uint8Array
}
export interface Follow {
  topic: number
  followees: Array<NeuronId>
}
export interface Followees {
  followees: Array<NeuronId>
}
export interface Governance {
  default_followees: Array<[number, Followees]>
  most_recent_monthly_node_provider_rewards: [] | [MostRecentMonthlyNodeProviderRewards]
  maturity_modulation_last_updated_at_timestamp_seconds: [] | [bigint]
  wait_for_quiet_threshold_seconds: bigint
  metrics: [] | [GovernanceCachedMetrics]
  node_providers: Array<NodeProvider>
  cached_daily_maturity_modulation_basis_points: [] | [number]
  economics: [] | [NetworkEconomics]
  spawning_neurons: [] | [boolean]
  latest_reward_event: [] | [RewardEvent]
  to_claim_transfers: Array<NeuronStakeTransfer>
  short_voting_period_seconds: bigint
  proposals: Array<[bigint, ProposalData]>
  in_flight_commands: Array<[bigint, NeuronInFlightCommand]>
  neurons: Array<[bigint, Neuron]>
  genesis_timestamp_seconds: bigint
}
export interface GovernanceCachedMetrics {
  not_dissolving_neurons_e8s_buckets: Array<[bigint, number]>
  garbage_collectable_neurons_count: bigint
  neurons_with_invalid_stake_count: bigint
  not_dissolving_neurons_count_buckets: Array<[bigint, bigint]>
  total_supply_icp: bigint
  neurons_with_less_than_6_months_dissolve_delay_count: bigint
  dissolved_neurons_count: bigint
  community_fund_total_maturity_e8s_equivalent: bigint
  total_staked_e8s: bigint
  not_dissolving_neurons_count: bigint
  dissolved_neurons_e8s: bigint
  neurons_with_less_than_6_months_dissolve_delay_e8s: bigint
  dissolving_neurons_count_buckets: Array<[bigint, bigint]>
  dissolving_neurons_count: bigint
  dissolving_neurons_e8s_buckets: Array<[bigint, number]>
  community_fund_total_staked_e8s: bigint
  timestamp_seconds: bigint
}
export interface GovernanceError {
  error_message: string
  error_type: number
}
export interface IncreaseDissolveDelay {
  additional_dissolve_delay_seconds: number
}
export interface KnownNeuron {
  id: [] | [NeuronId]
  known_neuron_data: [] | [KnownNeuronData]
}
export interface KnownNeuronData {
  name: string
  description: [] | [string]
}
export interface ListKnownNeuronsResponse {
  known_neurons: Array<KnownNeuron>
}
export interface ListNeurons {
  neuron_ids: BigUint64Array
  include_neurons_readable_by_caller: boolean
}
export interface ListNeuronsResponse {
  neuron_infos: Array<[bigint, NeuronInfo]>
  full_neurons: Array<Neuron>
}
export interface ListNodeProvidersResponse {
  node_providers: Array<NodeProvider>
}
export interface ListProposalInfo {
  include_reward_status: Int32Array
  before_proposal: [] | [NeuronId]
  limit: number
  exclude_topic: Int32Array
  include_status: Int32Array
}
export interface ListProposalInfoResponse {
  proposal_info: Array<ProposalInfo>
}
export interface MakeProposalResponse {
  proposal_id: [] | [NeuronId]
}
export interface ManageNeuron {
  id: [] | [NeuronId]
  command: [] | [Command]
  neuron_id_or_subaccount: [] | [NeuronIdOrSubaccount]
}
export interface ManageNeuronResponse {
  command: [] | [Command_1]
}
export interface Merge {
  source_neuron_id: [] | [NeuronId]
}
export interface MergeMaturity {
  percentage_to_merge: number
}
export interface MergeMaturityResponse {
  merged_maturity_e8s: bigint
  new_stake_e8s: bigint
}
export interface MostRecentMonthlyNodeProviderRewards {
  timestamp: bigint
  rewards: Array<RewardNodeProvider>
}
export interface Motion {
  motion_text: string
}
export interface NetworkEconomics {
  neuron_minimum_stake_e8s: bigint
  max_proposals_to_keep_per_topic: number
  neuron_management_fee_per_proposal_e8s: bigint
  reject_cost_e8s: bigint
  transaction_fee_e8s: bigint
  neuron_spawn_dissolve_delay_seconds: bigint
  minimum_icp_xdr_rate: bigint
  maximum_node_provider_rewards_e8s: bigint
}
export interface Neuron {
  id: [] | [NeuronId]
  staked_maturity_e8s_equivalent: [] | [bigint]
  controller: [] | [Principal]
  recent_ballots: Array<BallotInfo>
  kyc_verified: boolean
  not_for_profit: boolean
  maturity_e8s_equivalent: bigint
  cached_neuron_stake_e8s: bigint
  created_timestamp_seconds: bigint
  auto_stake_maturity: [] | [boolean]
  aging_since_timestamp_seconds: bigint
  hot_keys: Array<Principal>
  account: Uint8Array
  joined_community_fund_timestamp_seconds: [] | [bigint]
  dissolve_state: [] | [DissolveState]
  followees: Array<[number, Followees]>
  neuron_fees_e8s: bigint
  transfer: [] | [NeuronStakeTransfer]
  known_neuron_data: [] | [KnownNeuronData]
  spawn_at_timestamp_seconds: [] | [bigint]
}
export interface NeuronBasketConstructionParameters {
  dissolve_delay_interval_seconds: bigint
  count: bigint
}
export interface NeuronId {
  id: bigint
}
export type NeuronIdOrSubaccount = { Subaccount: Uint8Array } | { NeuronId: NeuronId }
export interface NeuronInFlightCommand {
  command: [] | [Command_2]
  timestamp: bigint
}
export interface NeuronInfo {
  dissolve_delay_seconds: bigint
  recent_ballots: Array<BallotInfo>
  created_timestamp_seconds: bigint
  state: number
  stake_e8s: bigint
  joined_community_fund_timestamp_seconds: [] | [bigint]
  retrieved_at_timestamp_seconds: bigint
  known_neuron_data: [] | [KnownNeuronData]
  voting_power: bigint
  age_seconds: bigint
}
export interface NeuronStakeTransfer {
  to_subaccount: Uint8Array
  neuron_stake_e8s: bigint
  from: [] | [Principal]
  memo: bigint
  from_subaccount: Uint8Array
  transfer_timestamp: bigint
  block_height: bigint
}
export interface NodeProvider {
  id: [] | [Principal]
  reward_account: [] | [AccountIdentifier]
}
export interface OpenSnsTokenSwap {
  community_fund_investment_e8s: [] | [bigint]
  target_swap_canister_id: [] | [Principal]
  params: [] | [Params]
}
export type Operation =
  | { RemoveHotKey: RemoveHotKey }
  | { AddHotKey: AddHotKey }
  | { ChangeAutoStakeMaturity: ChangeAutoStakeMaturity }
  | { StopDissolving: {} }
  | { StartDissolving: {} }
  | { IncreaseDissolveDelay: IncreaseDissolveDelay }
  | { JoinCommunityFund: {} }
  | { LeaveCommunityFund: {} }
  | { SetDissolveTimestamp: SetDissolveTimestamp }
export interface Params {
  min_participant_icp_e8s: bigint
  neuron_basket_construction_parameters: [] | [NeuronBasketConstructionParameters]
  max_icp_e8s: bigint
  swap_due_timestamp_seconds: bigint
  min_participants: number
  sns_token_e8s: bigint
  max_participant_icp_e8s: bigint
  min_icp_e8s: bigint
}
export interface Proposal {
  url: string
  title: [] | [string]
  action: [] | [Action]
  summary: string
}
export interface ProposalData {
  id: [] | [NeuronId]
  failure_reason: [] | [GovernanceError]
  cf_participants: Array<CfParticipant>
  ballots: Array<[bigint, Ballot]>
  proposal_timestamp_seconds: bigint
  reward_event_round: bigint
  failed_timestamp_seconds: bigint
  reject_cost_e8s: bigint
  latest_tally: [] | [Tally]
  sns_token_swap_lifecycle: [] | [number]
  decided_timestamp_seconds: bigint
  swap_background_information: [] | [SwapBackgroundInformation]
  proposal: [] | [Proposal]
  proposer: [] | [NeuronId]
  wait_for_quiet_state: [] | [WaitForQuietState]
  executed_timestamp_seconds: bigint
  original_total_community_fund_maturity_e8s_equivalent: [] | [bigint]
}
export interface ProposalInfo {
  id: [] | [NeuronId]
  status: number
  topic: number
  failure_reason: [] | [GovernanceError]
  ballots: Array<[bigint, Ballot]>
  proposal_timestamp_seconds: bigint
  reward_event_round: bigint
  deadline_timestamp_seconds: [] | [bigint]
  failed_timestamp_seconds: bigint
  reject_cost_e8s: bigint
  latest_tally: [] | [Tally]
  reward_status: number
  decided_timestamp_seconds: bigint
  proposal: [] | [Proposal]
  proposer: [] | [NeuronId]
  executed_timestamp_seconds: bigint
}
export interface RegisterVote {
  vote: number
  proposal: [] | [NeuronId]
}
export interface RemoveHotKey {
  hot_key_to_remove: [] | [Principal]
}
export type Result = { Ok: null } | { Err: GovernanceError }
export type Result_1 = { Error: GovernanceError } | { NeuronId: NeuronId }
export type Result_2 = { Ok: Neuron } | { Err: GovernanceError }
export type Result_3 = { Ok: RewardNodeProviders } | { Err: GovernanceError }
export type Result_4 = { Ok: NeuronInfo } | { Err: GovernanceError }
export type Result_5 = { Ok: NodeProvider } | { Err: GovernanceError }
export type Result_6 = { Committed: Committed } | { Aborted: {} }
export interface RewardEvent {
  day_after_genesis: bigint
  actual_timestamp_seconds: bigint
  distributed_e8s_equivalent: bigint
  settled_proposals: Array<NeuronId>
}
export type RewardMode = { RewardToNeuron: RewardToNeuron } | { RewardToAccount: RewardToAccount }
export interface RewardNodeProvider {
  node_provider: [] | [NodeProvider]
  reward_mode: [] | [RewardMode]
  amount_e8s: bigint
}
export interface RewardNodeProviders {
  use_registry_derived_rewards: [] | [boolean]
  rewards: Array<RewardNodeProvider>
}
export interface RewardToAccount {
  to_account: [] | [AccountIdentifier]
}
export interface RewardToNeuron {
  dissolve_delay_seconds: bigint
}
export interface SetDefaultFollowees {
  default_followees: Array<[number, Followees]>
}
export interface SetDissolveTimestamp {
  dissolve_timestamp_seconds: bigint
}
export interface SetOpenTimeWindowRequest {
  open_time_window: [] | [TimeWindow]
}
export interface SetSnsTokenSwapOpenTimeWindow {
  request: [] | [SetOpenTimeWindowRequest]
  swap_canister_id: [] | [Principal]
}
export interface SettleCommunityFundParticipation {
  result: [] | [Result_6]
  open_sns_token_swap_proposal_id: [] | [bigint]
}
export interface Spawn {
  percentage_to_spawn: [] | [number]
  new_controller: [] | [Principal]
  nonce: [] | [bigint]
}
export interface SpawnResponse {
  created_neuron_id: [] | [NeuronId]
}
export interface Split {
  amount_e8s: bigint
}
export interface StakeMaturity {
  percentage_to_stake: [] | [number]
}
export interface StakeMaturityResponse {
  maturity_e8s: bigint
  staked_maturity_e8s: bigint
}
export interface SwapBackgroundInformation {
  sns_root_canister_id: [] | [Principal]
  dapp_canister_ids: Array<Principal>
  fallback_controller_principal_ids: Array<Principal>
  sns_ledger_archive_canister_ids: Array<Principal>
  sns_ledger_index_canister_id: [] | [Principal]
  sns_ledger_canister_id: [] | [Principal]
  sns_governance_canister_id: [] | [Principal]
}
export interface Tally {
  no: bigint
  yes: bigint
  total: bigint
  timestamp_seconds: bigint
}
export interface TimeWindow {
  start_timestamp_seconds: bigint
  end_timestamp_seconds: bigint
}
export interface UpdateNodeProvider {
  reward_account: [] | [AccountIdentifier]
}
export interface WaitForQuietState {
  current_deadline_timestamp_seconds: bigint
}

export const idlFactory = ({ IDL }) => {
  const Proposal = IDL.Rec()
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const Followees = IDL.Record({ followees: IDL.Vec(NeuronId) })
  const AccountIdentifier = IDL.Record({ hash: IDL.Vec(IDL.Nat8) })
  const NodeProvider = IDL.Record({
    id: IDL.Opt(IDL.Principal),
    reward_account: IDL.Opt(AccountIdentifier)
  })
  const RewardToNeuron = IDL.Record({ dissolve_delay_seconds: IDL.Nat64 })
  const RewardToAccount = IDL.Record({
    to_account: IDL.Opt(AccountIdentifier)
  })
  const RewardMode = IDL.Variant({
    RewardToNeuron: RewardToNeuron,
    RewardToAccount: RewardToAccount
  })
  const RewardNodeProvider = IDL.Record({
    node_provider: IDL.Opt(NodeProvider),
    reward_mode: IDL.Opt(RewardMode),
    amount_e8s: IDL.Nat64
  })
  const MostRecentMonthlyNodeProviderRewards = IDL.Record({
    timestamp: IDL.Nat64,
    rewards: IDL.Vec(RewardNodeProvider)
  })
  const GovernanceCachedMetrics = IDL.Record({
    not_dissolving_neurons_e8s_buckets: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Float64)),
    garbage_collectable_neurons_count: IDL.Nat64,
    neurons_with_invalid_stake_count: IDL.Nat64,
    not_dissolving_neurons_count_buckets: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
    total_supply_icp: IDL.Nat64,
    neurons_with_less_than_6_months_dissolve_delay_count: IDL.Nat64,
    dissolved_neurons_count: IDL.Nat64,
    community_fund_total_maturity_e8s_equivalent: IDL.Nat64,
    total_staked_e8s: IDL.Nat64,
    not_dissolving_neurons_count: IDL.Nat64,
    total_locked_e8s: IDL.Nat64,
    dissolved_neurons_e8s: IDL.Nat64,
    neurons_with_less_than_6_months_dissolve_delay_e8s: IDL.Nat64,
    dissolving_neurons_count_buckets: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
    dissolving_neurons_count: IDL.Nat64,
    dissolving_neurons_e8s_buckets: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Float64)),
    community_fund_total_staked_e8s: IDL.Nat64,
    timestamp_seconds: IDL.Nat64
  })
  const NetworkEconomics = IDL.Record({
    neuron_minimum_stake_e8s: IDL.Nat64,
    max_proposals_to_keep_per_topic: IDL.Nat32,
    neuron_management_fee_per_proposal_e8s: IDL.Nat64,
    reject_cost_e8s: IDL.Nat64,
    transaction_fee_e8s: IDL.Nat64,
    neuron_spawn_dissolve_delay_seconds: IDL.Nat64,
    minimum_icp_xdr_rate: IDL.Nat64,
    maximum_node_provider_rewards_e8s: IDL.Nat64
  })
  const NeuronStakeTransfer = IDL.Record({
    to_subaccount: IDL.Vec(IDL.Nat8),
    neuron_stake_e8s: IDL.Nat64,
    from: IDL.Opt(IDL.Principal),
    memo: IDL.Nat64,
    from_subaccount: IDL.Vec(IDL.Nat8),
    transfer_timestamp: IDL.Nat64,
    block_height: IDL.Nat64
  })
  const GovernanceError = IDL.Record({
    error_message: IDL.Text,
    error_type: IDL.Int32
  })
  const Ballot = IDL.Record({ vote: IDL.Int32, voting_power: IDL.Nat64 })
  const CanisterStatusResultV2 = IDL.Record({
    status: IDL.Opt(IDL.Int32),
    freezing_threshold: IDL.Opt(IDL.Nat64),
    controllers: IDL.Vec(IDL.Principal),
    memory_size: IDL.Opt(IDL.Nat64),
    cycles: IDL.Opt(IDL.Nat64),
    idle_cycles_burned_per_day: IDL.Opt(IDL.Nat64),
    module_hash: IDL.Vec(IDL.Nat8)
  })
  const CanisterSummary = IDL.Record({
    status: IDL.Opt(CanisterStatusResultV2),
    canister_id: IDL.Opt(IDL.Principal)
  })
  const SwapBackgroundInformation = IDL.Record({
    ledger_index_canister_summary: IDL.Opt(CanisterSummary),
    fallback_controller_principal_ids: IDL.Vec(IDL.Principal),
    ledger_archive_canister_summaries: IDL.Vec(CanisterSummary),
    ledger_canister_summary: IDL.Opt(CanisterSummary),
    swap_canister_summary: IDL.Opt(CanisterSummary),
    governance_canister_summary: IDL.Opt(CanisterSummary),
    root_canister_summary: IDL.Opt(CanisterSummary),
    dapp_canister_summaries: IDL.Vec(CanisterSummary)
  })
  const DerivedProposalInformation = IDL.Record({
    swap_background_information: IDL.Opt(SwapBackgroundInformation)
  })
  const Tally = IDL.Record({
    no: IDL.Nat64,
    yes: IDL.Nat64,
    total: IDL.Nat64,
    timestamp_seconds: IDL.Nat64
  })
  const KnownNeuronData = IDL.Record({
    name: IDL.Text,
    description: IDL.Opt(IDL.Text)
  })
  const KnownNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    known_neuron_data: IDL.Opt(KnownNeuronData)
  })
  const Spawn = IDL.Record({
    percentage_to_spawn: IDL.Opt(IDL.Nat32),
    new_controller: IDL.Opt(IDL.Principal),
    nonce: IDL.Opt(IDL.Nat64)
  })
  const Split = IDL.Record({ amount_e8s: IDL.Nat64 })
  const Follow = IDL.Record({
    topic: IDL.Int32,
    followees: IDL.Vec(NeuronId)
  })
  const ClaimOrRefreshNeuronFromAccount = IDL.Record({
    controller: IDL.Opt(IDL.Principal),
    memo: IDL.Nat64
  })
  const By = IDL.Variant({
    NeuronIdOrSubaccount: IDL.Record({}),
    MemoAndController: ClaimOrRefreshNeuronFromAccount,
    Memo: IDL.Nat64
  })
  const ClaimOrRefresh = IDL.Record({ by: IDL.Opt(By) })
  const RemoveHotKey = IDL.Record({
    hot_key_to_remove: IDL.Opt(IDL.Principal)
  })
  const AddHotKey = IDL.Record({ new_hot_key: IDL.Opt(IDL.Principal) })
  const ChangeAutoStakeMaturity = IDL.Record({
    requested_setting_for_auto_stake_maturity: IDL.Bool
  })
  const IncreaseDissolveDelay = IDL.Record({
    additional_dissolve_delay_seconds: IDL.Nat32
  })
  const SetDissolveTimestamp = IDL.Record({
    dissolve_timestamp_seconds: IDL.Nat64
  })
  const Operation = IDL.Variant({
    RemoveHotKey: RemoveHotKey,
    AddHotKey: AddHotKey,
    ChangeAutoStakeMaturity: ChangeAutoStakeMaturity,
    StopDissolving: IDL.Record({}),
    StartDissolving: IDL.Record({}),
    IncreaseDissolveDelay: IncreaseDissolveDelay,
    JoinCommunityFund: IDL.Record({}),
    LeaveCommunityFund: IDL.Record({}),
    SetDissolveTimestamp: SetDissolveTimestamp
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const RegisterVote = IDL.Record({
    vote: IDL.Int32,
    proposal: IDL.Opt(NeuronId)
  })
  const Merge = IDL.Record({ source_neuron_id: IDL.Opt(NeuronId) })
  const DisburseToNeuron = IDL.Record({
    dissolve_delay_seconds: IDL.Nat64,
    kyc_verified: IDL.Bool,
    amount_e8s: IDL.Nat64,
    new_controller: IDL.Opt(IDL.Principal),
    nonce: IDL.Nat64
  })
  const StakeMaturity = IDL.Record({
    percentage_to_stake: IDL.Opt(IDL.Nat32)
  })
  const MergeMaturity = IDL.Record({ percentage_to_merge: IDL.Nat32 })
  const Amount = IDL.Record({ e8s: IDL.Nat64 })
  const Disburse = IDL.Record({
    to_account: IDL.Opt(AccountIdentifier),
    amount: IDL.Opt(Amount)
  })
  const Command = IDL.Variant({
    Spawn: Spawn,
    Split: Split,
    Follow: Follow,
    ClaimOrRefresh: ClaimOrRefresh,
    Configure: Configure,
    RegisterVote: RegisterVote,
    Merge: Merge,
    DisburseToNeuron: DisburseToNeuron,
    MakeProposal: Proposal,
    StakeMaturity: StakeMaturity,
    MergeMaturity: MergeMaturity,
    Disburse: Disburse
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })
  const ExecuteNnsFunction = IDL.Record({
    nns_function: IDL.Int32,
    payload: IDL.Vec(IDL.Nat8)
  })
  const NeuronBasketConstructionParameters = IDL.Record({
    dissolve_delay_interval_seconds: IDL.Nat64,
    count: IDL.Nat64
  })
  const Params = IDL.Record({
    min_participant_icp_e8s: IDL.Nat64,
    neuron_basket_construction_parameters: IDL.Opt(NeuronBasketConstructionParameters),
    max_icp_e8s: IDL.Nat64,
    swap_due_timestamp_seconds: IDL.Nat64,
    min_participants: IDL.Nat32,
    sns_token_e8s: IDL.Nat64,
    sale_delay_seconds: IDL.Opt(IDL.Nat64),
    max_participant_icp_e8s: IDL.Nat64,
    min_icp_e8s: IDL.Nat64
  })
  const OpenSnsTokenSwap = IDL.Record({
    community_fund_investment_e8s: IDL.Opt(IDL.Nat64),
    target_swap_canister_id: IDL.Opt(IDL.Principal),
    params: IDL.Opt(Params)
  })
  const TimeWindow = IDL.Record({
    start_timestamp_seconds: IDL.Nat64,
    end_timestamp_seconds: IDL.Nat64
  })
  const SetOpenTimeWindowRequest = IDL.Record({
    open_time_window: IDL.Opt(TimeWindow)
  })
  const SetSnsTokenSwapOpenTimeWindow = IDL.Record({
    request: IDL.Opt(SetOpenTimeWindowRequest),
    swap_canister_id: IDL.Opt(IDL.Principal)
  })
  const SetDefaultFollowees = IDL.Record({
    default_followees: IDL.Vec(IDL.Tuple(IDL.Int32, Followees))
  })
  const RewardNodeProviders = IDL.Record({
    use_registry_derived_rewards: IDL.Opt(IDL.Bool),
    rewards: IDL.Vec(RewardNodeProvider)
  })
  const ApproveGenesisKyc = IDL.Record({
    principals: IDL.Vec(IDL.Principal)
  })
  const Change = IDL.Variant({
    ToRemove: NodeProvider,
    ToAdd: NodeProvider
  })
  const AddOrRemoveNodeProvider = IDL.Record({ change: IDL.Opt(Change) })
  const Motion = IDL.Record({ motion_text: IDL.Text })
  const Action = IDL.Variant({
    RegisterKnownNeuron: KnownNeuron,
    ManageNeuron: ManageNeuron,
    ExecuteNnsFunction: ExecuteNnsFunction,
    RewardNodeProvider: RewardNodeProvider,
    OpenSnsTokenSwap: OpenSnsTokenSwap,
    SetSnsTokenSwapOpenTimeWindow: SetSnsTokenSwapOpenTimeWindow,
    SetDefaultFollowees: SetDefaultFollowees,
    RewardNodeProviders: RewardNodeProviders,
    ManageNetworkEconomics: NetworkEconomics,
    ApproveGenesisKyc: ApproveGenesisKyc,
    AddOrRemoveNodeProvider: AddOrRemoveNodeProvider,
    Motion: Motion
  })
  Proposal.fill(
    IDL.Record({
      url: IDL.Text,
      title: IDL.Opt(IDL.Text),
      action: IDL.Opt(Action),
      summary: IDL.Text
    })
  )
  const BallotInfo = IDL.Record({
    vote: IDL.Int32,
    proposal_id: IDL.Opt(NeuronId)
  })
  const DissolveState = IDL.Variant({
    DissolveDelaySeconds: IDL.Nat64,
    WhenDissolvedTimestampSeconds: IDL.Nat64
  })
  const Neuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    staked_maturity_e8s_equivalent: IDL.Opt(IDL.Nat64),
    controller: IDL.Opt(IDL.Principal),
    recent_ballots: IDL.Vec(BallotInfo),
    kyc_verified: IDL.Bool,
    not_for_profit: IDL.Bool,
    maturity_e8s_equivalent: IDL.Nat64,
    cached_neuron_stake_e8s: IDL.Nat64,
    created_timestamp_seconds: IDL.Nat64,
    auto_stake_maturity: IDL.Opt(IDL.Bool),
    aging_since_timestamp_seconds: IDL.Nat64,
    hot_keys: IDL.Vec(IDL.Principal),
    account: IDL.Vec(IDL.Nat8),
    joined_community_fund_timestamp_seconds: IDL.Opt(IDL.Nat64),
    dissolve_state: IDL.Opt(DissolveState),
    followees: IDL.Vec(IDL.Tuple(IDL.Int32, Followees)),
    neuron_fees_e8s: IDL.Nat64,
    transfer: IDL.Opt(NeuronStakeTransfer),
    known_neuron_data: IDL.Opt(KnownNeuronData),
    spawn_at_timestamp_seconds: IDL.Opt(IDL.Nat64)
  })
  const Result = IDL.Variant({ Ok: IDL.Null, Err: GovernanceError })
  const Result_1 = IDL.Variant({
    Error: GovernanceError,
    NeuronId: NeuronId
  })
  const ClaimOrRefreshNeuronFromAccountResponse = IDL.Record({
    result: IDL.Opt(Result_1)
  })
  const Result_2 = IDL.Variant({ Ok: Neuron, Err: GovernanceError })
  const Result_3 = IDL.Variant({
    Ok: GovernanceCachedMetrics,
    Err: GovernanceError
  })
  const Result_4 = IDL.Variant({
    Ok: RewardNodeProviders,
    Err: GovernanceError
  })
  const NeuronInfo = IDL.Record({
    dissolve_delay_seconds: IDL.Nat64,
    recent_ballots: IDL.Vec(BallotInfo),
    created_timestamp_seconds: IDL.Nat64,
    state: IDL.Int32,
    stake_e8s: IDL.Nat64,
    joined_community_fund_timestamp_seconds: IDL.Opt(IDL.Nat64),
    retrieved_at_timestamp_seconds: IDL.Nat64,
    known_neuron_data: IDL.Opt(KnownNeuronData),
    voting_power: IDL.Nat64,
    age_seconds: IDL.Nat64
  })
  const Result_5 = IDL.Variant({ Ok: NeuronInfo, Err: GovernanceError })
  const Result_6 = IDL.Variant({
    Ok: NodeProvider,
    Err: GovernanceError
  })
  const ProposalInfo = IDL.Record({
    id: IDL.Opt(NeuronId),
    status: IDL.Int32,
    topic: IDL.Int32,
    failure_reason: IDL.Opt(GovernanceError),
    ballots: IDL.Vec(IDL.Tuple(IDL.Nat64, Ballot)),
    proposal_timestamp_seconds: IDL.Nat64,
    reward_event_round: IDL.Nat64,
    deadline_timestamp_seconds: IDL.Opt(IDL.Nat64),
    failed_timestamp_seconds: IDL.Nat64,
    reject_cost_e8s: IDL.Nat64,
    derived_proposal_information: IDL.Opt(DerivedProposalInformation),
    latest_tally: IDL.Opt(Tally),
    reward_status: IDL.Int32,
    decided_timestamp_seconds: IDL.Nat64,
    proposal: IDL.Opt(Proposal),
    proposer: IDL.Opt(NeuronId),
    executed_timestamp_seconds: IDL.Nat64
  })
  const ListKnownNeuronsResponse = IDL.Record({
    known_neurons: IDL.Vec(KnownNeuron)
  })
  const ListNeurons = IDL.Record({
    neuron_ids: IDL.Vec(IDL.Nat64),
    include_neurons_readable_by_caller: IDL.Bool
  })
  const ListNeuronsResponse = IDL.Record({
    neuron_infos: IDL.Vec(IDL.Tuple(IDL.Nat64, NeuronInfo)),
    full_neurons: IDL.Vec(Neuron)
  })
  const ListNodeProvidersResponse = IDL.Record({
    node_providers: IDL.Vec(NodeProvider)
  })
  const ListProposalInfo = IDL.Record({
    include_reward_status: IDL.Vec(IDL.Int32),
    before_proposal: IDL.Opt(NeuronId),
    limit: IDL.Nat32,
    exclude_topic: IDL.Vec(IDL.Int32),
    include_status: IDL.Vec(IDL.Int32)
  })
  const ListProposalInfoResponse = IDL.Record({
    proposal_info: IDL.Vec(ProposalInfo)
  })
  const SpawnResponse = IDL.Record({ created_neuron_id: IDL.Opt(NeuronId) })
  const ClaimOrRefreshResponse = IDL.Record({
    refreshed_neuron_id: IDL.Opt(NeuronId)
  })
  const MakeProposalResponse = IDL.Record({
    proposal_id: IDL.Opt(NeuronId)
  })
  const StakeMaturityResponse = IDL.Record({
    maturity_e8s: IDL.Nat64,
    staked_maturity_e8s: IDL.Nat64
  })
  const MergeMaturityResponse = IDL.Record({
    merged_maturity_e8s: IDL.Nat64,
    new_stake_e8s: IDL.Nat64
  })
  const DisburseResponse = IDL.Record({ transfer_block_height: IDL.Nat64 })
  const Command_1 = IDL.Variant({
    Error: GovernanceError,
    Spawn: SpawnResponse,
    Split: SpawnResponse,
    Follow: IDL.Record({}),
    ClaimOrRefresh: ClaimOrRefreshResponse,
    Configure: IDL.Record({}),
    RegisterVote: IDL.Record({}),
    Merge: IDL.Record({}),
    DisburseToNeuron: SpawnResponse,
    MakeProposal: MakeProposalResponse,
    StakeMaturity: StakeMaturityResponse,
    MergeMaturity: MergeMaturityResponse,
    Disburse: DisburseResponse
  })
  const ManageNeuronResponse = IDL.Record({ command: IDL.Opt(Command_1) })
  const Committed = IDL.Record({
    sns_governance_canister_id: IDL.Opt(IDL.Principal)
  })
  const Result_7 = IDL.Variant({
    Committed: Committed,
    Aborted: IDL.Record({})
  })
  const SettleCommunityFundParticipation = IDL.Record({
    result: IDL.Opt(Result_7),
    open_sns_token_swap_proposal_id: IDL.Opt(IDL.Nat64)
  })
  const UpdateNodeProvider = IDL.Record({
    reward_account: IDL.Opt(AccountIdentifier)
  })
  return IDL.Service({
    claim_gtc_neurons: IDL.Func([IDL.Principal, IDL.Vec(NeuronId)], [Result], []),
    claim_or_refresh_neuron_from_account: IDL.Func([ClaimOrRefreshNeuronFromAccount], [ClaimOrRefreshNeuronFromAccountResponse], []),
    get_build_metadata: IDL.Func([], [IDL.Text], ['query']),
    get_full_neuron: IDL.Func([IDL.Nat64], [Result_2], ['query']),
    get_full_neuron_by_id_or_subaccount: IDL.Func([NeuronIdOrSubaccount], [Result_2], ['query']),
    get_metrics: IDL.Func([], [Result_3], ['query']),
    get_monthly_node_provider_rewards: IDL.Func([], [Result_4], []),
    get_most_recent_monthly_node_provider_rewards: IDL.Func([], [IDL.Opt(MostRecentMonthlyNodeProviderRewards)], ['query']),
    get_network_economics_parameters: IDL.Func([], [NetworkEconomics], ['query']),
    get_neuron_ids: IDL.Func([], [IDL.Vec(IDL.Nat64)], ['query']),
    get_neuron_info: IDL.Func([IDL.Nat64], [Result_5], ['query']),
    get_neuron_info_by_id_or_subaccount: IDL.Func([NeuronIdOrSubaccount], [Result_5], ['query']),
    get_node_provider_by_caller: IDL.Func([IDL.Null], [Result_6], ['query']),
    get_pending_proposals: IDL.Func([], [IDL.Vec(ProposalInfo)], ['query']),
    get_proposal_info: IDL.Func([IDL.Nat64], [IDL.Opt(ProposalInfo)], ['query']),
    list_known_neurons: IDL.Func([], [ListKnownNeuronsResponse], ['query']),
    list_neurons: IDL.Func([ListNeurons], [ListNeuronsResponse], ['query']),
    list_node_providers: IDL.Func([], [ListNodeProvidersResponse], ['query']),
    list_proposals: IDL.Func([ListProposalInfo], [ListProposalInfoResponse], ['query']),
    manage_neuron: IDL.Func([ManageNeuron], [ManageNeuronResponse], []),
    settle_community_fund_participation: IDL.Func([SettleCommunityFundParticipation], [Result], []),
    transfer_gtc_neuron: IDL.Func([NeuronId, NeuronId], [Result], []),
    update_node_provider: IDL.Func([UpdateNodeProvider], [Result], [])
  })
}
export const init = ({ IDL }) => {
  const Proposal = IDL.Rec()
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const Followees = IDL.Record({ followees: IDL.Vec(NeuronId) })
  const AccountIdentifier = IDL.Record({ hash: IDL.Vec(IDL.Nat8) })
  const NodeProvider = IDL.Record({
    id: IDL.Opt(IDL.Principal),
    reward_account: IDL.Opt(AccountIdentifier)
  })
  const RewardToNeuron = IDL.Record({ dissolve_delay_seconds: IDL.Nat64 })
  const RewardToAccount = IDL.Record({
    to_account: IDL.Opt(AccountIdentifier)
  })
  const RewardMode = IDL.Variant({
    RewardToNeuron: RewardToNeuron,
    RewardToAccount: RewardToAccount
  })
  const RewardNodeProvider = IDL.Record({
    node_provider: IDL.Opt(NodeProvider),
    reward_mode: IDL.Opt(RewardMode),
    amount_e8s: IDL.Nat64
  })
  const MostRecentMonthlyNodeProviderRewards = IDL.Record({
    timestamp: IDL.Nat64,
    rewards: IDL.Vec(RewardNodeProvider)
  })
  const GovernanceCachedMetrics = IDL.Record({
    not_dissolving_neurons_e8s_buckets: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Float64)),
    garbage_collectable_neurons_count: IDL.Nat64,
    neurons_with_invalid_stake_count: IDL.Nat64,
    not_dissolving_neurons_count_buckets: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
    total_supply_icp: IDL.Nat64,
    neurons_with_less_than_6_months_dissolve_delay_count: IDL.Nat64,
    dissolved_neurons_count: IDL.Nat64,
    community_fund_total_maturity_e8s_equivalent: IDL.Nat64,
    total_staked_e8s: IDL.Nat64,
    not_dissolving_neurons_count: IDL.Nat64,
    total_locked_e8s: IDL.Nat64,
    dissolved_neurons_e8s: IDL.Nat64,
    neurons_with_less_than_6_months_dissolve_delay_e8s: IDL.Nat64,
    dissolving_neurons_count_buckets: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
    dissolving_neurons_count: IDL.Nat64,
    dissolving_neurons_e8s_buckets: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Float64)),
    community_fund_total_staked_e8s: IDL.Nat64,
    timestamp_seconds: IDL.Nat64
  })
  const NetworkEconomics = IDL.Record({
    neuron_minimum_stake_e8s: IDL.Nat64,
    max_proposals_to_keep_per_topic: IDL.Nat32,
    neuron_management_fee_per_proposal_e8s: IDL.Nat64,
    reject_cost_e8s: IDL.Nat64,
    transaction_fee_e8s: IDL.Nat64,
    neuron_spawn_dissolve_delay_seconds: IDL.Nat64,
    minimum_icp_xdr_rate: IDL.Nat64,
    maximum_node_provider_rewards_e8s: IDL.Nat64
  })
  const RewardEvent = IDL.Record({
    day_after_genesis: IDL.Nat64,
    actual_timestamp_seconds: IDL.Nat64,
    distributed_e8s_equivalent: IDL.Nat64,
    settled_proposals: IDL.Vec(NeuronId)
  })
  const NeuronStakeTransfer = IDL.Record({
    to_subaccount: IDL.Vec(IDL.Nat8),
    neuron_stake_e8s: IDL.Nat64,
    from: IDL.Opt(IDL.Principal),
    memo: IDL.Nat64,
    from_subaccount: IDL.Vec(IDL.Nat8),
    transfer_timestamp: IDL.Nat64,
    block_height: IDL.Nat64
  })
  const GovernanceError = IDL.Record({
    error_message: IDL.Text,
    error_type: IDL.Int32
  })
  const CfNeuron = IDL.Record({
    nns_neuron_id: IDL.Nat64,
    amount_icp_e8s: IDL.Nat64
  })
  const CfParticipant = IDL.Record({
    hotkey_principal: IDL.Text,
    cf_neurons: IDL.Vec(CfNeuron)
  })
  const Ballot = IDL.Record({ vote: IDL.Int32, voting_power: IDL.Nat64 })
  const CanisterStatusResultV2 = IDL.Record({
    status: IDL.Opt(IDL.Int32),
    freezing_threshold: IDL.Opt(IDL.Nat64),
    controllers: IDL.Vec(IDL.Principal),
    memory_size: IDL.Opt(IDL.Nat64),
    cycles: IDL.Opt(IDL.Nat64),
    idle_cycles_burned_per_day: IDL.Opt(IDL.Nat64),
    module_hash: IDL.Vec(IDL.Nat8)
  })
  const CanisterSummary = IDL.Record({
    status: IDL.Opt(CanisterStatusResultV2),
    canister_id: IDL.Opt(IDL.Principal)
  })
  const SwapBackgroundInformation = IDL.Record({
    ledger_index_canister_summary: IDL.Opt(CanisterSummary),
    fallback_controller_principal_ids: IDL.Vec(IDL.Principal),
    ledger_archive_canister_summaries: IDL.Vec(CanisterSummary),
    ledger_canister_summary: IDL.Opt(CanisterSummary),
    swap_canister_summary: IDL.Opt(CanisterSummary),
    governance_canister_summary: IDL.Opt(CanisterSummary),
    root_canister_summary: IDL.Opt(CanisterSummary),
    dapp_canister_summaries: IDL.Vec(CanisterSummary)
  })
  const DerivedProposalInformation = IDL.Record({
    swap_background_information: IDL.Opt(SwapBackgroundInformation)
  })
  const Tally = IDL.Record({
    no: IDL.Nat64,
    yes: IDL.Nat64,
    total: IDL.Nat64,
    timestamp_seconds: IDL.Nat64
  })
  const KnownNeuronData = IDL.Record({
    name: IDL.Text,
    description: IDL.Opt(IDL.Text)
  })
  const KnownNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    known_neuron_data: IDL.Opt(KnownNeuronData)
  })
  const Spawn = IDL.Record({
    percentage_to_spawn: IDL.Opt(IDL.Nat32),
    new_controller: IDL.Opt(IDL.Principal),
    nonce: IDL.Opt(IDL.Nat64)
  })
  const Split = IDL.Record({ amount_e8s: IDL.Nat64 })
  const Follow = IDL.Record({
    topic: IDL.Int32,
    followees: IDL.Vec(NeuronId)
  })
  const ClaimOrRefreshNeuronFromAccount = IDL.Record({
    controller: IDL.Opt(IDL.Principal),
    memo: IDL.Nat64
  })
  const By = IDL.Variant({
    NeuronIdOrSubaccount: IDL.Record({}),
    MemoAndController: ClaimOrRefreshNeuronFromAccount,
    Memo: IDL.Nat64
  })
  const ClaimOrRefresh = IDL.Record({ by: IDL.Opt(By) })
  const RemoveHotKey = IDL.Record({
    hot_key_to_remove: IDL.Opt(IDL.Principal)
  })
  const AddHotKey = IDL.Record({ new_hot_key: IDL.Opt(IDL.Principal) })
  const ChangeAutoStakeMaturity = IDL.Record({
    requested_setting_for_auto_stake_maturity: IDL.Bool
  })
  const IncreaseDissolveDelay = IDL.Record({
    additional_dissolve_delay_seconds: IDL.Nat32
  })
  const SetDissolveTimestamp = IDL.Record({
    dissolve_timestamp_seconds: IDL.Nat64
  })
  const Operation = IDL.Variant({
    RemoveHotKey: RemoveHotKey,
    AddHotKey: AddHotKey,
    ChangeAutoStakeMaturity: ChangeAutoStakeMaturity,
    StopDissolving: IDL.Record({}),
    StartDissolving: IDL.Record({}),
    IncreaseDissolveDelay: IncreaseDissolveDelay,
    JoinCommunityFund: IDL.Record({}),
    LeaveCommunityFund: IDL.Record({}),
    SetDissolveTimestamp: SetDissolveTimestamp
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const RegisterVote = IDL.Record({
    vote: IDL.Int32,
    proposal: IDL.Opt(NeuronId)
  })
  const Merge = IDL.Record({ source_neuron_id: IDL.Opt(NeuronId) })
  const DisburseToNeuron = IDL.Record({
    dissolve_delay_seconds: IDL.Nat64,
    kyc_verified: IDL.Bool,
    amount_e8s: IDL.Nat64,
    new_controller: IDL.Opt(IDL.Principal),
    nonce: IDL.Nat64
  })
  const StakeMaturity = IDL.Record({
    percentage_to_stake: IDL.Opt(IDL.Nat32)
  })
  const MergeMaturity = IDL.Record({ percentage_to_merge: IDL.Nat32 })
  const Amount = IDL.Record({ e8s: IDL.Nat64 })
  const Disburse = IDL.Record({
    to_account: IDL.Opt(AccountIdentifier),
    amount: IDL.Opt(Amount)
  })
  const Command = IDL.Variant({
    Spawn: Spawn,
    Split: Split,
    Follow: Follow,
    ClaimOrRefresh: ClaimOrRefresh,
    Configure: Configure,
    RegisterVote: RegisterVote,
    Merge: Merge,
    DisburseToNeuron: DisburseToNeuron,
    MakeProposal: Proposal,
    StakeMaturity: StakeMaturity,
    MergeMaturity: MergeMaturity,
    Disburse: Disburse
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })
  const ExecuteNnsFunction = IDL.Record({
    nns_function: IDL.Int32,
    payload: IDL.Vec(IDL.Nat8)
  })
  const NeuronBasketConstructionParameters = IDL.Record({
    dissolve_delay_interval_seconds: IDL.Nat64,
    count: IDL.Nat64
  })
  const Params = IDL.Record({
    min_participant_icp_e8s: IDL.Nat64,
    neuron_basket_construction_parameters: IDL.Opt(NeuronBasketConstructionParameters),
    max_icp_e8s: IDL.Nat64,
    swap_due_timestamp_seconds: IDL.Nat64,
    min_participants: IDL.Nat32,
    sns_token_e8s: IDL.Nat64,
    sale_delay_seconds: IDL.Opt(IDL.Nat64),
    max_participant_icp_e8s: IDL.Nat64,
    min_icp_e8s: IDL.Nat64
  })
  const OpenSnsTokenSwap = IDL.Record({
    community_fund_investment_e8s: IDL.Opt(IDL.Nat64),
    target_swap_canister_id: IDL.Opt(IDL.Principal),
    params: IDL.Opt(Params)
  })
  const TimeWindow = IDL.Record({
    start_timestamp_seconds: IDL.Nat64,
    end_timestamp_seconds: IDL.Nat64
  })
  const SetOpenTimeWindowRequest = IDL.Record({
    open_time_window: IDL.Opt(TimeWindow)
  })
  const SetSnsTokenSwapOpenTimeWindow = IDL.Record({
    request: IDL.Opt(SetOpenTimeWindowRequest),
    swap_canister_id: IDL.Opt(IDL.Principal)
  })
  const SetDefaultFollowees = IDL.Record({
    default_followees: IDL.Vec(IDL.Tuple(IDL.Int32, Followees))
  })
  const RewardNodeProviders = IDL.Record({
    use_registry_derived_rewards: IDL.Opt(IDL.Bool),
    rewards: IDL.Vec(RewardNodeProvider)
  })
  const ApproveGenesisKyc = IDL.Record({
    principals: IDL.Vec(IDL.Principal)
  })
  const Change = IDL.Variant({
    ToRemove: NodeProvider,
    ToAdd: NodeProvider
  })
  const AddOrRemoveNodeProvider = IDL.Record({ change: IDL.Opt(Change) })
  const Motion = IDL.Record({ motion_text: IDL.Text })
  const Action = IDL.Variant({
    RegisterKnownNeuron: KnownNeuron,
    ManageNeuron: ManageNeuron,
    ExecuteNnsFunction: ExecuteNnsFunction,
    RewardNodeProvider: RewardNodeProvider,
    OpenSnsTokenSwap: OpenSnsTokenSwap,
    SetSnsTokenSwapOpenTimeWindow: SetSnsTokenSwapOpenTimeWindow,
    SetDefaultFollowees: SetDefaultFollowees,
    RewardNodeProviders: RewardNodeProviders,
    ManageNetworkEconomics: NetworkEconomics,
    ApproveGenesisKyc: ApproveGenesisKyc,
    AddOrRemoveNodeProvider: AddOrRemoveNodeProvider,
    Motion: Motion
  })
  Proposal.fill(
    IDL.Record({
      url: IDL.Text,
      title: IDL.Opt(IDL.Text),
      action: IDL.Opt(Action),
      summary: IDL.Text
    })
  )
  const WaitForQuietState = IDL.Record({
    current_deadline_timestamp_seconds: IDL.Nat64
  })
  const ProposalData = IDL.Record({
    id: IDL.Opt(NeuronId),
    failure_reason: IDL.Opt(GovernanceError),
    cf_participants: IDL.Vec(CfParticipant),
    ballots: IDL.Vec(IDL.Tuple(IDL.Nat64, Ballot)),
    proposal_timestamp_seconds: IDL.Nat64,
    reward_event_round: IDL.Nat64,
    failed_timestamp_seconds: IDL.Nat64,
    reject_cost_e8s: IDL.Nat64,
    derived_proposal_information: IDL.Opt(DerivedProposalInformation),
    latest_tally: IDL.Opt(Tally),
    sns_token_swap_lifecycle: IDL.Opt(IDL.Int32),
    decided_timestamp_seconds: IDL.Nat64,
    proposal: IDL.Opt(Proposal),
    proposer: IDL.Opt(NeuronId),
    wait_for_quiet_state: IDL.Opt(WaitForQuietState),
    executed_timestamp_seconds: IDL.Nat64,
    original_total_community_fund_maturity_e8s_equivalent: IDL.Opt(IDL.Nat64)
  })
  const Command_2 = IDL.Variant({
    Spawn: NeuronId,
    Split: Split,
    Configure: Configure,
    Merge: Merge,
    DisburseToNeuron: DisburseToNeuron,
    SyncCommand: IDL.Record({}),
    ClaimOrRefreshNeuron: ClaimOrRefresh,
    MergeMaturity: MergeMaturity,
    Disburse: Disburse
  })
  const NeuronInFlightCommand = IDL.Record({
    command: IDL.Opt(Command_2),
    timestamp: IDL.Nat64
  })
  const BallotInfo = IDL.Record({
    vote: IDL.Int32,
    proposal_id: IDL.Opt(NeuronId)
  })
  const DissolveState = IDL.Variant({
    DissolveDelaySeconds: IDL.Nat64,
    WhenDissolvedTimestampSeconds: IDL.Nat64
  })
  const Neuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    staked_maturity_e8s_equivalent: IDL.Opt(IDL.Nat64),
    controller: IDL.Opt(IDL.Principal),
    recent_ballots: IDL.Vec(BallotInfo),
    kyc_verified: IDL.Bool,
    not_for_profit: IDL.Bool,
    maturity_e8s_equivalent: IDL.Nat64,
    cached_neuron_stake_e8s: IDL.Nat64,
    created_timestamp_seconds: IDL.Nat64,
    auto_stake_maturity: IDL.Opt(IDL.Bool),
    aging_since_timestamp_seconds: IDL.Nat64,
    hot_keys: IDL.Vec(IDL.Principal),
    account: IDL.Vec(IDL.Nat8),
    joined_community_fund_timestamp_seconds: IDL.Opt(IDL.Nat64),
    dissolve_state: IDL.Opt(DissolveState),
    followees: IDL.Vec(IDL.Tuple(IDL.Int32, Followees)),
    neuron_fees_e8s: IDL.Nat64,
    transfer: IDL.Opt(NeuronStakeTransfer),
    known_neuron_data: IDL.Opt(KnownNeuronData),
    spawn_at_timestamp_seconds: IDL.Opt(IDL.Nat64)
  })
  const Governance = IDL.Record({
    default_followees: IDL.Vec(IDL.Tuple(IDL.Int32, Followees)),
    most_recent_monthly_node_provider_rewards: IDL.Opt(MostRecentMonthlyNodeProviderRewards),
    maturity_modulation_last_updated_at_timestamp_seconds: IDL.Opt(IDL.Nat64),
    wait_for_quiet_threshold_seconds: IDL.Nat64,
    metrics: IDL.Opt(GovernanceCachedMetrics),
    node_providers: IDL.Vec(NodeProvider),
    cached_daily_maturity_modulation_basis_points: IDL.Opt(IDL.Int32),
    economics: IDL.Opt(NetworkEconomics),
    spawning_neurons: IDL.Opt(IDL.Bool),
    latest_reward_event: IDL.Opt(RewardEvent),
    to_claim_transfers: IDL.Vec(NeuronStakeTransfer),
    short_voting_period_seconds: IDL.Nat64,
    proposals: IDL.Vec(IDL.Tuple(IDL.Nat64, ProposalData)),
    in_flight_commands: IDL.Vec(IDL.Tuple(IDL.Nat64, NeuronInFlightCommand)),
    neurons: IDL.Vec(IDL.Tuple(IDL.Nat64, Neuron)),
    genesis_timestamp_seconds: IDL.Nat64
  })
  return [Governance]
}

export const ListNeurons = IDL.Record({
  neuron_ids: IDL.Vec(IDL.Nat64),
  include_neurons_readable_by_caller: IDL.Bool
})
