// Models/Voice/InterpretRequest.cs
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

public class InterpretRequest
{
    [Required]
    public IFormFile Audio { get; set; } = default!;
}
