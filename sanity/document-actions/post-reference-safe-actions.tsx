import { useState } from "react";
import { useClient, type DocumentActionComponent } from "sanity";

const SANITY_API_VERSION = "2025-03-01";

type ActionWithId = DocumentActionComponent & {
  action?: string;
};

function toPublishedDocumentId(id?: string) {
  if (!id) {
    return "";
  }

  return id.replace(/^drafts\./, "");
}

async function deleteCommentsForPost(client: ReturnType<typeof useClient>, postId: string) {
  if (!postId) {
    return;
  }

  const commentIds = await client.fetch<string[]>(
    `*[_type == "comment" && post._ref == $postId]._id`,
    { postId },
  );

  if (!commentIds.length) {
    return;
  }

  let transaction = client.transaction();

  for (const commentId of commentIds) {
    transaction = transaction.delete(commentId);
  }

  await transaction.commit();
}

function createPostCleanupAction(
  OriginalAction: ActionWithId,
  pendingLabel: string,
): ActionWithId {
  const WrappedAction: ActionWithId = function WrappedAction(props) {
    const action = OriginalAction(props);
    const client = useClient({ apiVersion: SANITY_API_VERSION });
    const [isRunning, setIsRunning] = useState(false);

    if (!action) {
      return null;
    }

    return {
      ...action,
      label: isRunning ? pendingLabel : action.label,
      disabled: Boolean(action.disabled) || isRunning,
      onHandle: async () => {
        setIsRunning(true);

        try {
          const postId = toPublishedDocumentId(
            props.published?._id || props.draft?._id || props.id,
          );

          await deleteCommentsForPost(client, postId);
          await action.onHandle?.();
        } finally {
          setIsRunning(false);
        }
      },
    };
  };

  WrappedAction.action = OriginalAction.action;

  return WrappedAction;
}

export function createCommentSafeDeleteAction(OriginalAction: ActionWithId): ActionWithId {
  return createPostCleanupAction(OriginalAction, "Deleting...");
}

export function createCommentSafeUnpublishAction(OriginalAction: ActionWithId): ActionWithId {
  return createPostCleanupAction(OriginalAction, "Unpublishing...");
}
