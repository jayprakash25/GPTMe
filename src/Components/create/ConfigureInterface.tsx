import { useState } from 'react'
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { Label } from "@/Components/ui/label"
import { useToast } from '@/hooks/use-toast'
export default function ConfigureInterface({ avatarConfig, setAvatarConfig }) {
  const [errors, setErrors] = useState({})
  const { toast } = useToast()

  const handleChange = (e) => {
    // const { name, value } = e.target
    // setAvatarConfig(prev => ({ ...prev, [name]: value }))
    // if (errors[name]) {
    //   setErrors(prev => ({ ...prev, [name]: '' }))
    // }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // const newErrors = {}
    // if (!avatarConfig.name.trim()) newErrors.name = 'Name is required'
    // if (!avatarConfig.interests.trim()) newErrors.interests = 'Interests are required'
    // if (!avatarConfig.personality.trim()) newErrors.personality = 'Personality is required'

    // if (Object.keys(newErrors).length > 0) {
    //   setErrors(newErrors)
    // } else {
    //   toast({
    //     title: "Avatar Updated",
    //     description: "Your avatar configuration has been successfully updated.",
    //   })
    // }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={avatarConfig.name}
          onChange={handleChange}
          placeholder="Enter avatar name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="interests">Interests</Label>
        <Input
          id="interests"
          name="interests"
          value={avatarConfig.interests}
          onChange={handleChange}
          placeholder="Enter avatar interests"
        />
        {errors.interests && <p className="text-red-500 text-sm mt-1">{errors.interests}</p>}
      </div>
      <div>
        <Label htmlFor="personality">Personality</Label>
        <Textarea
          id="personality"
          name="personality"
          value={avatarConfig.personality}
          onChange={handleChange}
          placeholder="Describe avatar personality"
          rows={3}
        />
        {errors.personality && <p className="text-red-500 text-sm mt-1">{errors.personality}</p>}
      </div>
      <Button type="submit" className="w-full">Update Avatar</Button>
    </form>
  )
}