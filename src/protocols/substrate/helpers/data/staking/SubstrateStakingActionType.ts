export enum SubstrateStakingActionType {
    BOND_NOMINATE = 'bond_nominate', 
    NOMINATE = 'nominate', 
    CANCEL_NOMINATION = 'cancel_nomination',
    CHANGE_NOMINATION = 'change_nomination',
    UNBOND = 'unbond', 
    REBOND = 'rebond', 
    BOND_EXTRA = 'bond_extra', 
    WITHDRAW_UNBONDED = 'withdraw_unbonded', 
    CHANGE_REWARD_DESTINATION = 'change_reward_destination',
    CHANGE_CONTROLLER = 'change_controller'
}