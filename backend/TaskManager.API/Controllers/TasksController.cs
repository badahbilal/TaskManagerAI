using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;

namespace TaskManager.API.Controllers;

[Authorize]
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
    public async Task<ActionResult<List<TaskDto>>> GetAll([FromQuery] DateOnly? date, CancellationToken cancellationToken)
    {
        int userId = GetCurrentUserId();
        List<TaskDto> tasks = await _taskService.GetTasksByDateAsync(userId, date, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<List<TaskDto>>> GetUpcoming(CancellationToken cancellationToken)
    {
        int userId = GetCurrentUserId();
        List<TaskDto> tasks = await _taskService.GetUpcomingTasksAsync(userId, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskDto>> GetById(int id, CancellationToken cancellationToken)
    {
        int userId = GetCurrentUserId();
        TaskDto? task = await _taskService.GetTaskByIdAsync(id, userId, cancellationToken);
        if (task == null)
        {
            return NotFound();
        }

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create([FromBody] CreateTaskDto dto, CancellationToken cancellationToken)
    {
        int userId = GetCurrentUserId();
        try
        {
            TaskDto createdTask = await _taskService.CreateTaskAsync(dto, userId, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = createdTask.Id }, createdTask);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskDto>> Update(int id, [FromBody] UpdateTaskDto dto, CancellationToken cancellationToken)
    {
        int userId = GetCurrentUserId();
        try
        {
            TaskDto? updatedTask = await _taskService.UpdateTaskAsync(id, dto, userId, cancellationToken);
            if (updatedTask == null)
            {
                return NotFound();
            }

            return Ok(updatedTask);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        int userId = GetCurrentUserId();
        try
        {
            bool deleted = await _taskService.DeleteTaskAsync(id, userId, cancellationToken);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int GetCurrentUserId()
    {
        string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("User identifier not found in token claims.");
        }

        return userId;
    }
}
