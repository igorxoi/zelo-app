import { useCallback, useEffect, useState } from "react";

import type { Profile } from "@/services/auth";
import {
  disablePush,
  enablePush,
  getPushStatus,
  type PushStatus,
} from "@/services/push";

export function usePush(profile: Profile) {
  const [status, setStatus] = useState<PushStatus>("unsupported");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getPushStatus().then((next) => {
      if (active) setStatus(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      await enablePush(profile);
    } finally {
      setBusy(false);
      setStatus(await getPushStatus());
    }
  }, [profile]);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      await disablePush(profile);
    } finally {
      setBusy(false);
      setStatus(await getPushStatus());
    }
  }, [profile]);

  return { status, busy, enable, disable };
}
