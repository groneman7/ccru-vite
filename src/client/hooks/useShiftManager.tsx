import { useState } from "react";

type CreateShift = {
  tempId: string;
  positionId: number;
  quantity: number;
};

export function useShiftManager() {
  const [state, setState] = useState({
    existing: [],
    staged: {
      create: [] as CreateShift[],
      // update: [],
      delete: [],
    },
  });

  const addShift = (positionId: number, quantity: number) => {
    setState((prev) => ({
      ...prev,
      staged: {
        ...prev.staged,
        create: [
          ...prev.staged.create,
          {
            tempId: "",
            positionId,
            quantity,
          },
        ],
      },
    }));
  };
}
