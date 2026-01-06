// PeriodTypeDto.cs
using System;

namespace HelpDesk.BonusSystem.Lookups.Dtos
{
    public class PeriodTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public long? CreatorUserId { get; set; }
        public string CreatorUserName { get; set; }
        public int? TenantId { get; set; }
    }
}