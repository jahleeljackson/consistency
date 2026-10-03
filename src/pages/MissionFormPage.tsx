import { Link, useNavigate, useParams } from 'react-router-dom'
import { MissionForm } from '../features/missions/MissionForm.tsx'
import { useCairn } from '../store/CairnProvider.tsx'

export function MissionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, createNewMission, saveMission } = useCairn()
  const mission = id ? state.missions.find((item) => item.id === id) : undefined

  if (id && !mission) {
    return (
      <p>
        This mission is no longer here.{' '}
        <Link to="/" className="font-semibold">
          Back to missions
        </Link>
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link to={mission ? `/missions/${mission.id}` : '/'}>Back</Link>
        </p>
        <h1 className="font-display mt-2 text-4xl">
          {mission ? 'Edit mission' : 'New mission'}
        </h1>
      </div>
      <MissionForm
        mission={mission}
        submitLabel={mission ? 'Save changes' : 'Create mission'}
        onSubmit={async (draft) => {
          if (mission) {
            await saveMission(mission.id, draft)
            navigate(`/missions/${mission.id}`)
            return
          }
          const createdId = await createNewMission(draft)
          navigate(`/missions/${createdId}`)
        }}
      />
    </div>
  )
}
