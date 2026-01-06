using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.PriorityLevels.Dto
{
    [AutoMapTo(typeof(PriorityLevels))]
    public class UpdatePriorityLevelInput : EntityDto<int>
    {
        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        [Required]
        [Range(0, 100)]
        public int Percentage { get; set; }
    }
}