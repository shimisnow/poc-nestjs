## How to retrieve the account balance in a financial application

### The problem

In an application that stores the user transactions as debit and credit operation, how can we calculate and retrieve the account balance in a efficient way.

### The Solution

```mermaid
stateDiagram-v2
direction LR

classDef rest_req_res fill:yellow,color:black,font-weight:bold,stroke-width:2px,stroke:black

state "REST API request" as api_req
class api_req rest_req_res

[*] --> api_req

state "Verifies if account balance exists in cache" as get_balance
api_req --> get_balance

state has_cache <<choice>>
get_balance --> has_cache

state "Return balance" as return_balance
has_cache --> return_balance: balance in cache

state retrieve <<fork>>
has_cache --> retrieve: balance not in cache

state "Retrieves balance from database" as retrieve_database
retrieve --> retrieve_database
state "Retrieves unprocessed transactions" as transactions
retrieve --> transactions

state merge <<join>>
retrieve_database --> merge
transactions --> merge

state "Sums the stored balance with the unprocessed transactions" as compute_balance
merge --> compute_balance

state "Save on cache" as save_cache
compute_balance --> save_cache

save_cache --> return_balance

state "REST API response" as api_res
class api_res rest_req_res

return_balance --> api_res
api_res --> [*]
```

#### Database

- Use of two database tables. One to store the transactions and one to store the balance.
- The balances table stores the account balance and the last transaction id that was processed to generate the balance.
- When the balance is required, the transactions with id greater than the one stored at the table is processed and the value is merged with the stored balance. The new balance is than stored at the balances table along side with the max transaction id processed.

#### Efficiency

To make the retrieve operation efficient, a cache manager is used as the following:

- When the balance is required, the cache is consulted. If there is a value, it will be returned and there is no database operation performed. If there is no value, the solution mentioned at the database section will be performed and the result will be cached.
- Every time a transaction is made, the balance cache is erased.
