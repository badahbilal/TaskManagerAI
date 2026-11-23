using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskDto>>> GetAll(CancellationToken cancellationToken)
    {
        List<TaskDto> tasks = await _taskService.GetAllTasksAsync(cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskDto>> GetById(int id, CancellationToken cancellationToken)
    {
        TaskDto? task = await _taskService.GetTaskByIdAsync(id, cancellationToken);
        if (task == null)
        {
            return NotFound();
        }

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create([FromBody] CreateTaskDto dto, CancellationToken cancellationToken)
    {
        TaskDto createdTask = await _taskService.CreateTaskAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = createdTask.Id }, createdTask);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskDto>> Update(int id, [FromBody] UpdateTaskDto dto, CancellationToken cancellationToken)
    {
        TaskDto? updatedTask = await _taskService.UpdateTaskAsync(id, dto, cancellationToken);
        if (updatedTask == null)
        {
            return NotFound();
        }

        return Ok(updatedTask);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        bool deleted = await _taskService.DeleteTaskAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
