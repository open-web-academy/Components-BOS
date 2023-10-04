// SPDX-License-Identifier: GPL-3.0 
pragma solidity >=0.8.0 <0.9.0; 

contract ToDoList{
	struct Task
	{
		string task;
		bool isDone;
	}

	mapping (address => Task[]) private Users;
		
	// Definimos función para añadir una nueva tarea
	function addTask(string calldata _task) external
	{
		Users[msg.sender].push(Task({
			task:_task,
			isDone:false
		}));
	}

	// Definimos función para ver los detalles de una tarea
	function getTask(uint _taskIndex) external view returns (Task memory)
	{
		Task storage task = Users[msg.sender][_taskIndex];
		return task;
	}

	// Definimos función para actualizar el estatus de una tarea
	function updateStatus(uint256 _taskIndex,bool _status) external
	{
		Users[msg.sender][_taskIndex].isDone = _status;
	}

	// Definimos función para eliminar una  tarea
	function deleteTask(uint256 _taskIndex) external
	{
		delete Users[msg.sender][_taskIndex];
	}

	// Definimos función para obtener el contador de tareas del usuario
	function getTaskCount() external view returns (uint256)
	{
		return Users[msg.sender].length;
	}
}