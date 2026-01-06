using System.ComponentModel.DataAnnotations;

namespace HelpDesk.Users.Dto;

public class ChangeUserLanguageDto
{
    [Required]
    public string LanguageName { get; set; }
}