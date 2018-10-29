import test from 'ava'
import { DAG } from './DAG'

test('traverse empty DAG', t => {
  const dag = new DAG()

  t.deepEqual(Array.from(dag.traverse()), [])
})

test('traverse single-node DAG', t => {
  const dag = new DAG([['a', 'a']])

  t.deepEqual(Array.from(dag.traverse()), [
    { key: 'a', origin: true, terminal: true },
  ])
})

test('traverse linear DAG', t => {
  const dag = new DAG([['a', 'b'], ['b', 'c'], ['c', 'd']])

  t.deepEqual(Array.from(dag.traverse()), [
    { key: 'a', origin: true, terminal: false },
    { key: 'b', origin: false, terminal: false },
    { key: 'c', origin: false, terminal: false },
    { key: 'd', origin: false, terminal: true },
  ])
})

test('traverse diamond DAG', t => {
  const dag = new DAG([['a', 'b'], ['a', 'c'], ['b', 'd'], ['c', 'd']])

  t.deepEqual(Array.from(dag.traverse()), [
    { key: 'a', origin: true, terminal: false },
    { key: 'b', origin: false, terminal: false },
    { key: 'c', origin: false, terminal: false },
    { key: 'd', origin: false, terminal: true },
  ])
})

test('traverse complicated DAG', t => {
  const dag = new DAG([
    ['a', 'b'],
    ['a', 'c'],
    ['b', 'd'],
    ['c', 'd'],
    ['a', 'e'],
    ['d', 'e'],
    ['e', 'f'],
    ['c', 'g'],
    ['f', 'g'],
    ['g', 'h'],
  ])

  t.deepEqual(Array.from(dag.traverse()), [
    { key: 'a', origin: true, terminal: false },
    { key: 'b', origin: false, terminal: false },
    { key: 'c', origin: false, terminal: false },
    { key: 'd', origin: false, terminal: false },
    { key: 'e', origin: false, terminal: false },
    { key: 'f', origin: false, terminal: false },
    { key: 'g', origin: false, terminal: false },
    { key: 'h', origin: false, terminal: true },
  ])
})

test('traverse number DAG', t => {
  const dag = new DAG([[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]])

  t.deepEqual(Array.from(dag.traverse()), [
    { key: 0, origin: true, terminal: false },
    { key: 1, origin: false, terminal: false },
    { key: 2, origin: false, terminal: false },
    { key: 3, origin: false, terminal: false },
    { key: 4, origin: false, terminal: true },
  ])
})

test('traverse in reverse', t => {
  const dag = new DAG([
    ['a', 'b'],
    ['a', 'c'],
    ['b', 'd'],
    ['c', 'd'],
    ['a', 'e'],
    ['d', 'e'],
    ['e', 'f'],
    ['c', 'g'],
    ['f', 'g'],
    ['g', 'h'],
  ])

  t.deepEqual(Array.from(dag.traverse({ reverse: true })), [
    { key: 'h', origin: true, terminal: false },
    { key: 'g', origin: false, terminal: false },
    { key: 'f', origin: false, terminal: false },
    { key: 'e', origin: false, terminal: false },
    { key: 'd', origin: false, terminal: false },
    { key: 'c', origin: false, terminal: false },
    { key: 'b', origin: false, terminal: false },
    { key: 'a', origin: false, terminal: true },
  ])
})
