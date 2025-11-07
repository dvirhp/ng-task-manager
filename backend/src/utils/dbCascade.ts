import TodoList from "../todoLists/todoList.model.js";
import Task from "../tasks/task.model.js";

// Delete all tasks related to a specific list
export async function cascadeDeleteList(listId: string): Promise<void> {
  await Task.deleteMany({ list: listId });
  console.log(`Deleted all tasks for list ${listId}`);
}

// Delete tasks for multiple lists
export async function cascadeDeleteLists(listIds: string[]): Promise<void> {
  if (!listIds.length) return;
  await Task.deleteMany({ list: { $in: listIds } });
  console.log(`Deleted tasks for ${listIds.length} lists`);
}

// Delete a user's lists and all related tasks
export async function cascadeDeleteUser(userId: string): Promise<void> {
  const lists = await TodoList.find({ owner: userId }).select("_id").lean();
  const listIds = lists.map((l) => l._id);

  if (listIds.length > 0) {
    await Task.deleteMany({ list: { $in: listIds } });
    await TodoList.deleteMany({ owner: userId });
    console.log(
      `Deleted ${listIds.length} lists and their tasks for user ${userId}`,
    );
  } else {
    console.log(`No lists found for user ${userId}, nothing to delete`);
  }
}

// Delete lists and tasks for multiple users
export async function cascadeDeleteUsers(userIds: string[]): Promise<void> {
  if (!userIds.length) return;

  const lists = await TodoList.find({ owner: { $in: userIds } })
    .select("_id")
    .lean();
  const listIds = lists.map((l) => l._id);

  if (listIds.length > 0) {
    await Task.deleteMany({ list: { $in: listIds } });
    await TodoList.deleteMany({ owner: { $in: userIds } });
    console.log(
      `Deleted ${listIds.length} lists and their tasks for ${userIds.length} users`,
    );
  } else {
    console.log(`No lists found for ${userIds.length} users`);
  }
}
