import { useEffect, useState } from "react";
import {
  exportData,
  getDataFilePath,
  getDefaultDataFilePath,
  importData,
  openDataFolder,
  pickDataFilePath,
  setDataFilePath,
} from "../api/settings";
import type { AppData } from "../types";
import { IconClose } from "./Icons";

interface SettingsDialogProps {
  open: boolean;
  data: AppData;
  onClose: () => void;
  onDataImported: (data: AppData) => void;
  onPathChanged: () => void;
  showToast: (message: string) => void;
}

export function SettingsDialog({
  open,
  data,
  onClose,
  onDataImported,
  onPathChanged,
  showToast,
}: SettingsDialogProps) {
  const [dataPath, setDataPath] = useState("");
  const [defaultPath, setDefaultPath] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    void Promise.all([getDataFilePath(), getDefaultDataFilePath()]).then(
      ([current, defaultP]) => {
        setDataPath(current);
        setDefaultPath(defaultP);
      },
    );
  }, [open]);

  if (!open) return null;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "操作失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">设置</h3>
          <button
            type="button"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <section>
            <label className="text-xs font-medium text-gray-500">数据文件路径</label>
            <p className="mt-1 break-all rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
              {dataPath || "加载中..."}
            </p>
            <p className="mt-1 text-xs text-gray-400">默认路径：{defaultPath}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() =>
                  void run(async () => {
                    const picked = await pickDataFilePath();
                    if (!picked) return;
                    const next = await setDataFilePath(picked);
                    setDataPath(next);
                    onPathChanged();
                    showToast("数据路径已更新");
                  })
                }
              >
                更改路径
              </button>
              <button
                type="button"
                disabled={busy}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() =>
                  void run(async () => {
                    const next = await setDataFilePath(null);
                    setDataPath(next);
                    onPathChanged();
                    showToast("已恢复默认路径");
                  })
                }
              >
                恢复默认
              </button>
              <button
                type="button"
                disabled={busy}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() =>
                  void run(async () => {
                    await openDataFolder();
                  })
                }
              >
                打开文件夹
              </button>
            </div>
          </section>

          <section className="border-t border-gray-100 pt-4">
            <label className="text-xs font-medium text-gray-500">数据备份</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                className="rounded-md bg-blue-500 px-3 py-1.5 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
                onClick={() =>
                  void run(async () => {
                    const saved = await exportData(data);
                    if (saved) showToast("导出成功");
                  })
                }
              >
                导出数据
              </button>
              <button
                type="button"
                disabled={busy}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() =>
                  void run(async () => {
                    const imported = await importData();
                    if (!imported) return;
                    const path = await getDataFilePath();
                    onDataImported(imported);
                    setDataPath(path);
                    showToast("导入成功");
                    onClose();
                  })
                }
              >
                导入数据
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              导出为 JSON 备份文件；导入将覆盖当前数据文件内容。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
