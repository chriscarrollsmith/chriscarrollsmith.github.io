import { useMemo, useState } from 'react';
import './XorDemo.css';

type Operation = 'XOR' | 'AND' | 'OR';

const OPERATIONS: Record<
  Operation,
  { op: (a: number, b: number) => number; description: string }
> = {
  XOR: {
    op: (a, b) => a ^ b,
    description: 'Perfectly balanced. Equal 0s and 1s, regardless of input.',
  },
  AND: {
    op: (a, b) => a & b,
    description: 'Imbalanced, biased towards 0. May leak input information.',
  },
  OR: {
    op: (a, b) => a | b,
    description: 'Imbalanced, biased towards 1. May leak input information.',
  },
};

const TRUTH_TABLE_INPUTS: Array<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

export default function XorDemo() {
  const [operation, setOperation] = useState<Operation>('XOR');

  const { rows, prob0, prob1, description } = useMemo(() => {
    const op = OPERATIONS[operation];
    let count0 = 0;
    let count1 = 0;

    const computedRows = TRUTH_TABLE_INPUTS.map(([a, b]) => {
      const result = op.op(a, b);
      if (result === 0) count0 += 1;
      else count1 += 1;
      return { a, b, result };
    });

    return {
      rows: computedRows,
      prob0: count0 * 25,
      prob1: count1 * 25,
      description: op.description,
    };
  }, [operation]);

  return (
    <div className="container">
      <div className="xor-demo-controls" role="group" aria-label="Select a bitwise operation">
        {(Object.keys(OPERATIONS) as Operation[]).map(op => (
          <button
            key={op}
            type="button"
            className={`operation-btn ${op === operation ? 'is-active' : ''}`}
            data-op={op}
            aria-pressed={op === operation}
            onClick={() => setOperation(op)}
          >
            {op}
          </button>
        ))}
      </div>

      <table className="xor-demo-table">
        <thead>
          <tr>
            <th scope="col">A</th>
            <th scope="col">B</th>
            <th scope="col">
              <span className="operator">{operation}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ a, b, result }) => (
            <tr key={`${a}-${b}`}>
              <td>{a}</td>
              <td>{b}</td>
              <td className="result">{result}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="balance-info">
        <p>
          Probability of 0: <span className="probability">{prob0}</span>%
        </p>
        <p>
          Probability of 1: <span className="probability">{prob1}</span>%
        </p>
        <p className="balance-description">{description}</p>
      </div>
    </div>
  );
}

