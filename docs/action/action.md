# Action

## Introduction

Actions are used to encapsulate simple workflows into a generic interface. Multiple actions can be composed together to build more complex workflows.

## Using actions

The `Action<Result, Context>` abstract class defines the `start()` method used to execute the action.

An action is intiliazed with a `Context` and produces a `Result`. To create your own action, sublcass `Action<Result, Context>` and implement the `perform()` method.

```typescript
interface EncryptContext {
    message: string
}

class EncryptAction: Action<string, EncryptContext> {
    public readonly identifier: string = 'encrypt-action'

    protected async perform(): Promise<string> {
        return Encrypt(this.context.message)
    }
}

let action = new EncryptAction({ message: "hello, world!" })

try {
    await action.start()
    let result = action.result
    /// use encrypted result
} catch (error) {
    // handle error
}
```

## SimpleAction

The `SimpleAction<Result>` is a concrete subclass of `Action<Result, void>` that can be used to easily provide an action inline.

```typescript
const message = 'hello, world!'
let action: SimpleAction<string> = new SimpleAction(() => {
  return new Promise<string>(resolve => {
    resolve(Encrypt(message))
  })
})
```

## LinkedAction

The `LinkedAction<Result, Context>` is a concrete subclass of `Action<Result, void>` that can be used to "link" two actions together, meaning that the `Result` of the first action is used by the second action.

```typescript
let fetchMessageAction: SimpleAction<EncryptContext> = new SimpleAction(() => {
  return new Promise<EncryptContext>(resolve => {
    let result = await fetchMessage()
    resolve({ message: result })
  })
})

let fetchAndEncryptAction: LinkedAction<string, EncryptContext> = LinkedAction(fetchMessageAction, EncryptAction)

try {
  await fetchAndEncryptAction.start()
  let result = action.result
  /// use encrypted result
} catch (error) {
  // handle error
}
```
