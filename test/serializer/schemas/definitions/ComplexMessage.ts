export interface ComplexMessage {
  name: string
  test: number
  bool: boolean
  obj1: {
    name: string
    test: number
    bool: boolean
  }
  arr1: string[]
  arr2: number[]
  arr3: boolean[]
  arr4: { name: string; test: number; bool: boolean }[]
  arr5: [string, string, string, number, boolean, { name: string; test: number; bool: boolean }]
  obj2: {
    name: string
    test: number
    bool: boolean
    obj1: {
      name: string
      test: number
      bool: boolean
    }
    arr1: string[]
    arr2: number[]
    arr3: boolean[]
    arr4: { name: string; test: number; bool: boolean }[]
    arr5: [string, string, string, number, boolean, { name: string; test: number; bool: boolean }]
  }
  obj3: {
    arr1: string[][][]
  }
  obj4: {
    arr1: [
      {
        arr1: [
          {
            name: string
          }
        ]
      },
      {
        arr1: {
          name: string
        }[]
      }
    ]
  }
}
