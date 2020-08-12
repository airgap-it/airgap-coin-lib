const syncCode =
  'Gfeetd57BGjJdZNGa2RFaYNASLxbbvnUCphrgCthrSv3C8pt8Vt5awPZj9pe64jQUeHDpWNPczcUVrruB331UJVRh2RsCgdH4rBuwVpPqVUzcK7kUbMpZ3MSGZJLXt9DhWmqSHCNt6ihVqkZyepfbfYb2Cno,Gfeetd57BJPpnkzFkZCxmW1CWqzrnuPwbArEvGTD44UBzN3VLQqCrM953YmPMsFaMaBQXdd37khXRoEts35W3LE1rdfHrNuyJTydqM1x4EtKnk79QKbvhorbnx56WiGNP3wAxhE78nVDWzbyfWwoYrt5Q4kp,Gfeetd57BL4Lwy34oMbobcsXJwdeZpm3KNsd16ZZTAe9VeU1KYhUqHRLnaTa93cKrumunDmCfrFGEmZ7uSam2oVcrZEvqshDvhHRzByJ8mhSVApBgvbZuMGQ9dQBbmxGF2KtrBizwGXoqXMcXmn1Hzaf5CaY,Gfeetd57BMis7BKSAPDCBryvzWVsiwFGr4zKtLqy66Z8B5DvcyKjZ9wb9GkK4Bi8kw4JbbFvz3RgFcDo5ogBwsmZ7ZMeeAEDBxVhGFw6MonzYQNxrXmBtqY7JdpnmF9mwJihfbztDTEf8u4RKx5ozD7RBSyZ,Gfeetd57BPPPGPajQoCUWNVrwbgdVbGEhzTNHy2x3LkcWeQpDXN7aeJM5S7mYHKmM8EgWnueDq5h6Ew8frThsF2eXzLfB427HPujHY5x8yhCQuDCpQ6HH5t5vXTNcEx8B9hfbcid54njx9WznMs9u7cGWuzJ,HB6K2QCAYxGBtAYeKD7QF7crdLC9UiUp1SUzZ8mFt9ehuygFzvgYMryMRdJzY5LgVfDe2EvJHzHn571MEQvbCBoRurUrz9u4ZkmX'
const parts = syncCode.split(',')

import { IACMessageDefinitionObject } from '../src/serializer/message'
import { Serializer } from '../src/serializer/serializer'

const test = async () => {
  const serializer: Serializer = new Serializer()

  const reconstructed: IACMessageDefinitionObject[] = await serializer.deserialize(parts)

  console.log(
    'reconstructed',
    reconstructed.map((el) => JSON.stringify(el))
  )
}

test()
