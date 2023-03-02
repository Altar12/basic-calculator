use anchor_lang::prelude::*;

declare_id!("FSfRonZ4p4XuXNRZQTV8hziV18uaH29fDka4zEKXEcoW");

#[program]
pub mod basic_calculator {

    use super::*;

    pub fn create(ctx: Context<Create>, message: String) -> Result<()> {
        ctx.accounts.calculator.set_inner(Calculator {
            greeting: message,
            user: ctx.accounts.user.key(),
            result: 0,
        });
        Ok(())
    }
    pub fn operate(
        ctx: Context<Operate>,
        num1: i64,
        num2: i64,
        operation: Operation,
    ) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        match operation {
            Operation::Addition => {
                if let Some(res) = num1.checked_add(num2) {
                    calculator.result = res;
                } else {
                    return Err(CalcError::OutOfBounds.into());
                }
            }
            Operation::Subtraction => {
                if let Some(res) = num1.checked_sub(num2) {
                    calculator.result = res;
                } else {
                    return Err(CalcError::OutOfBounds.into());
                }
            }
            Operation::Multiplication => {
                if let Some(res) = num1.checked_mul(num2) {
                    calculator.result = res;
                } else {
                    return Err(CalcError::OutOfBounds.into());
                }
            }
            Operation::Division => {
                require!(num2 != 0, CalcError::ZeroDivisor);
                calculator.result = num1 / num2;
            }
            Operation::Mod => {
                require!(num2 != 0, CalcError::ZeroDivisor);
                calculator.result = num1 % num2;
            }
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer=user, space=8+(4+50)+32+8)] // max allowed size for greeting = 50bytes
    pub calculator: Account<'info, Calculator>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Operate<'info> {
    #[account(mut, has_one=user @ CalcError::Unauthorized)]
    pub calculator: Account<'info, Calculator>,
    pub user: Signer<'info>,
}

#[account]
pub struct Calculator {
    pub greeting: String,
    pub user: Pubkey,
    pub result: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum Operation {
    Addition,
    Subtraction,
    Multiplication,
    Division,
    Mod,
}

#[error_code]
pub enum CalcError {
    #[msg("The calculator account passed does not belong to the user")]
    Unauthorized,
    #[msg("The operation result exceeded storage bounds")]
    OutOfBounds,
    #[msg("Divisor specified is zero")]
    ZeroDivisor,
}
