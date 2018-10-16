import test from 'ava'
import { DAG } from './DAG'

test('traverse empty DAG', t => {
  const dag = new DAG()

  t.deepEqual(Array.from(dag.traverse()), [])
})

test('traverse single-node DAG', t => {
  const dag = new DAG([['a', 'a']])

  t.deepEqual(Array.from(dag.traverse()), ['a'])
})

test('traverse linear DAG', t => {
  const dag = new DAG([['a', 'b'], ['b', 'c'], ['c', 'd']])

  t.deepEqual(Array.from(dag.traverse()), ['a', 'b', 'c', 'd'])
})

test('traverse diamond DAG', t => {
  const dag = new DAG([['a', 'b'], ['a', 'c'], ['b', 'd'], ['c', 'd']])

  t.deepEqual(Array.from(dag.traverse()), ['a', 'b', 'c', 'd'])
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
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
  ])
})
